import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import type {
	CreateTransactionData,
	TransactionEntity,
} from 'src/types/index.type';

type AccountFilter = {
	OR: [{ sourceAccountId: number }, { destinationAccountId: number }];
};

@Injectable()
export class TransactionsRepository {
	constructor(private readonly prisma: PrismaService) {}

	findByIdempotencyKey(key: string): Promise<TransactionEntity | null> {
		return this.prisma.transaction.findUnique({
			where: { idempotencyKey: key },
		});
	}

	createDeposit(
		accountId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		return this.prisma.$transaction(async (tx) => {
			const transaction = await tx.transaction.create({
				data: {
					destinationAccountId: accountId,
					amount: dto.amount,
					type: dto.type,
					description: dto.description,
					idempotencyKey,
				},
			});
			await tx.account.update({
				where: { id: accountId },
				data: { balance: { increment: new Prisma.Decimal(dto.amount) } },
			});
			return transaction;
		});
	}

	createWithdrawal(
		accountId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		return this.prisma.$transaction(async (tx) => {
			const [account] = await tx.$queryRaw<{ balance: Prisma.Decimal }[]>`
				SELECT balance FROM accounts WHERE id = ${accountId} FOR UPDATE
			`;
			if (
				new Prisma.Decimal(account.balance).lt(new Prisma.Decimal(dto.amount))
			) {
				throw new BadRequestException('Insufficient balance');
			}

			const transaction = await tx.transaction.create({
				data: {
					sourceAccountId: accountId,
					amount: dto.amount,
					type: dto.type,
					description: dto.description,
					idempotencyKey,
				},
			});
			await tx.account.update({
				where: { id: accountId },
				data: { balance: { decrement: new Prisma.Decimal(dto.amount) } },
			});
			return transaction;
		});
	}

	createTransfer(
		sourceAccountId: number,
		destinationAccountId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		return this.prisma.$transaction(async (tx) => {
			const [sourceAccount] = await tx.$queryRaw<{ balance: Prisma.Decimal }[]>`
				SELECT balance FROM accounts WHERE id = ${sourceAccountId} FOR UPDATE
			`;
			if (
				new Prisma.Decimal(sourceAccount.balance).lt(
					new Prisma.Decimal(dto.amount)
				)
			) {
				throw new BadRequestException('Insufficient balance');
			}

			const transaction = await tx.transaction.create({
				data: {
					sourceAccountId,
					destinationAccountId,
					amount: dto.amount,
					type: dto.type,
					description: dto.description,
					idempotencyKey,
				},
			});
			await tx.account.update({
				where: { id: sourceAccountId },
				data: { balance: { decrement: new Prisma.Decimal(dto.amount) } },
			});
			await tx.account.update({
				where: { id: destinationAccountId },
				data: { balance: { increment: new Prisma.Decimal(dto.amount) } },
			});
			return transaction;
		});
	}
	// READ
	findAllByAccount(
		filter: AccountFilter,
		skip: number,
		take: number
	): Promise<TransactionEntity[]> {
		return this.prisma.transaction.findMany({
			where: filter,
			skip,
			take,
			orderBy: { createdAt: 'desc' },
		});
	}

	countByAccount(filter: AccountFilter): Promise<number> {
		return this.prisma.transaction.count({ where: filter });
	}

	findOneWithAccounts(id: number) {
		return this.prisma.transaction.findUnique({
			where: { id },
			include: {
				sourceAccount: { select: { userId: true } },
				destinationAccount: { select: { userId: true } },
			},
		});
	}
}
