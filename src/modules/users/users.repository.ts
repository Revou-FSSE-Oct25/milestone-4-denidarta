import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
	UpdateUserData,
	UserEntity,
	UserWithCredentials,
} from 'src/types/index.type';
import { UserRole } from '@prisma/client';
import { buildUserSearchWhere } from '../../common/helpers/search.helper';

export const payloadFormat = {
	id: true,
	name: true,
	email: true,
	createdAt: true,
	updatedAt: true,
} as const;

@Injectable()
export class UsersRepository {
	constructor(private prisma: PrismaService) {}

	create(data: {
		email: string;
		password: string;
		name: string;
		role: UserRole;
	}) {
		return this.prisma.user.create({ data });
	}

	findAll(skip: number, take: number, search?: string): Promise<UserEntity[]> {
		const where = {
			deletedAt: null,
			...(search ? buildUserSearchWhere(search) : {}),
		};
		return this.prisma.user.findMany({
			select: payloadFormat,
			skip,
			take,
			where,
		});
	}

	count(search?: string): Promise<number> {
		const where = {
			deletedAt: null,
			...(search ? buildUserSearchWhere(search) : {}),
		};
		return this.prisma.user.count({ where });
	}

	findById(id: number): Promise<UserEntity | null> {
		return this.prisma.user.findUnique({
			where: { id, deletedAt: null },
			select: payloadFormat,
		});
	}

	findByEmail(email: string): Promise<UserEntity | null> {
		return this.prisma.user.findUnique({
			where: { email, deletedAt: null },
			select: payloadFormat,
		});
	}

	findByEmailWithPassword(email: string): Promise<UserWithCredentials | null> {
		return this.prisma.user.findUnique({
			where: { email, deletedAt: null },
			select: {
				...payloadFormat,
				password: true,
				role: true,
			},
		});
	}

	update(id: number, data: UpdateUserData): Promise<UserEntity> {
		return this.prisma.user.update({
			where: { id },
			data,
			select: payloadFormat,
		});
	}

	async softDelete(id: number): Promise<UserEntity> {
		await this.prisma.account.updateMany({
			where: { userId: id },
			data: { status: 'FROZEN' },
		});
		return this.prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
			select: payloadFormat,
		});
	}
}
