import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsRepository } from './transactions.repository';
import {
	buildPaginationParams,
	buildPaginatedResult,
} from 'src/common/helpers/pagination.helper';
import { resolveIdempotency } from 'src/common/helpers/idempotency.helper';
import type {
	CreateTransactionData,
	PaginatedResult,
	TransactionEntity,
} from 'src/types/index.type';
import { UserRole } from 'src/types/index.type';

@Injectable()
export class TransactionsService {
	constructor(
		private repository: TransactionsRepository,
		private accounts: AccountsService
	) {}

	async create(
		accountId: number,
		userId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		const existing = await resolveIdempotency(idempotencyKey, (key) =>
			this.repository.findByIdempotencyKey(key)
		);
		if (existing) return existing;

		switch (dto.type) {
			case TransactionType.DEPOSIT:
				return this.createDeposit(accountId, userId, dto, idempotencyKey);
			case TransactionType.WITHDRAWAL:
				return this.createWithdrawal(accountId, userId, dto, idempotencyKey);
			default:
				return this.createTransfer(accountId, userId, dto, idempotencyKey);
		}
	}

	private async createDeposit(
		accountId: number,
		userId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		await this.accounts.findById(accountId, userId);
		return this.repository.createDeposit(accountId, dto, idempotencyKey);
	}

	private async createWithdrawal(
		accountId: number,
		userId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		await this.accounts.findById(accountId, userId);
		return this.repository.createWithdrawal(accountId, dto, idempotencyKey);
	}

	private async createTransfer(
		accountId: number,
		userId: number,
		dto: CreateTransactionData,
		idempotencyKey?: string
	): Promise<TransactionEntity> {
		await this.accounts.findById(accountId, userId);

		// destination ownership is not checked — any active account can receive a transfer
		await this.accounts.findById(
			dto.destinationAccountId!,
			userId,
			UserRole.ADMIN
		);

		return this.repository.createTransfer(
			accountId,
			dto.destinationAccountId!,
			dto,
			idempotencyKey
		);
	}

	async findAll(
		accountId: number,
		userId: number,
		page = 1,
		limit = 20,
		role?: UserRole
	): Promise<PaginatedResult<TransactionEntity>> {
		await this.accounts.findById(accountId, userId, role);

		const { skip, take } = buildPaginationParams(page, limit);
		const filter = {
			OR: [
				{ sourceAccountId: accountId },
				{ destinationAccountId: accountId },
			] as [{ sourceAccountId: number }, { destinationAccountId: number }],
		};

		const [data, total] = await Promise.all([
			this.repository.findAllByAccount(filter, skip, take),
			this.repository.countByAccount(filter),
		]);

		return buildPaginatedResult(data, total, page, limit);
	}

	async findOne(
		id: number,
		userId: number,
		role?: UserRole
	): Promise<TransactionEntity> {
		const transaction = await this.repository.findOneWithAccounts(id);
		if (!transaction) throw new NotFoundException('Transaction not found');

		if (role !== UserRole.ADMIN) {
			const isOwner =
				transaction.sourceAccount?.userId === userId ||
				transaction.destinationAccount?.userId === userId;
			if (!isOwner) throw new ForbiddenException();
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { sourceAccount, destinationAccount, ...result } = transaction;
		return result;
	}
}
