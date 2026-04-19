import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { UsersRepository } from 'src/modules/users/users.repository';
import type { CreateUserData, LoginData } from 'src/types/index.type';

@Injectable()
export class AuthService {
	constructor(
		private usersRepository: UsersRepository,
		private jwt: JwtService
	) {}

	async register(data: CreateUserData) {
		const existing = await this.usersRepository.findByEmail(data.email);
		if (existing) throw new ConflictException('Email already in use');

		const hash = await bcrypt.hash(data.password, 10);
		const user = await this.usersRepository.create({
			email: data.email,
			password: hash,
			name: data.name ?? '',
			role: UserRole.USER,
		});

		return this.signToken(user.id, user.email, UserRole.USER);
	}

	async login(data: LoginData) {
		const user = await this.usersRepository.findByEmailWithPassword(data.email);
		if (!user) throw new UnauthorizedException('Invalid credentials');

		const valid = await bcrypt.compare(data.password, user.password);
		if (!valid) throw new UnauthorizedException('Invalid credentials');

		return this.signToken(user.id, user.email, user.role);
	}

	private async signToken(
		userId: number,
		email: string,
		role: UserRole
	): Promise<{ access_token: string }> {
		const access_token = await this.jwt.signAsync({ sub: userId, email, role });
		return { access_token };
	}
}
