import { Transform } from 'class-transformer';
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
	@ApiProperty({ example: '100.00', description: 'Transaction amount' })
	@Transform(({ value }: { value: string }) => new Decimal(value))
	@IsNotEmpty()
	amount: Decimal;

	@ApiProperty({ enum: TransactionType, example: TransactionType.DEPOSIT })
	@IsNotEmpty()
	@IsEnum(TransactionType)
	type: TransactionType;

	@ApiProperty({ example: 'Monthly salary', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 'account-uuid', required: false })
	@IsOptional()
	@IsString()
	sourceAccountId?: string;

	@ApiProperty({ example: 'account-uuid', required: false, description: 'Required for TRANSFER' })
	@ValidateIf((o: CreateTransactionDto) => o.type === TransactionType.TRANSFER)
	@IsNotEmpty()
	@IsString()
	destinationAccountId?: string;
}
