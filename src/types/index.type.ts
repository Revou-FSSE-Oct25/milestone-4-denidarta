import {
	AccountStatus,
	Prisma,
	TransactionType,
	UserRole,
} from '@prisma/client';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
	userId: string;
	email: string;
	role: UserRole;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export class ApiResponse<T> {
	status: number;
	message: string;
	data?: T | null;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserEntity {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserWithCredentials extends UserEntity {
	password: string;
	role: UserRole;
}

export interface UpdateUserData {
	name?: string;
	email?: string;
}

// ─── Account ─────────────────────────────────────────────────────────────────

export interface AccountEntity {
	id: string;
	accountNumber: number;
	status: AccountStatus;
	balance: Prisma.Decimal;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

export interface UpdateAccountData {
	status?: AccountStatus;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface TransactionEntity {
	id: string;
	amount: Prisma.Decimal;
	type: TransactionType;
	description?: string | null;
	createdAt: Date;
	sourceAccountId?: string | null;
	destinationAccountId?: string | null;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}
