import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
	UpdateUserData,
	UserEntity,
	UserWithCredentials,
} from 'src/types/index.type';

const userSelect = {
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
		role: import('@prisma/client').UserRole;
	}) {
		return this.prisma.user.create({ data });
	}

	findAll(): Promise<UserEntity[]> {
		return this.prisma.user.findMany({ select: userSelect });
	}

	findById(id: string): Promise<UserEntity | null> {
		return this.prisma.user.findUnique({ where: { id }, select: userSelect });
	}

	findByEmail(email: string): Promise<UserEntity | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: userSelect,
		});
	}

	findByEmailWithPassword(email: string): Promise<UserWithCredentials | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: {
				...userSelect,
				password: true,
				role: true,
			},
		});
	}

	update(id: string, data: UpdateUserData): Promise<UserEntity> {
		return this.prisma.user.update({ where: { id }, data, select: userSelect });
	}

	delete(id: string): Promise<UserEntity> {
		return this.prisma.user.delete({ where: { id }, select: userSelect });
	}
}
