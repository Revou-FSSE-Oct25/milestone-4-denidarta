import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import type { UpdateUserData, UserEntity } from 'src/types/index.type';

@Injectable()
export class UsersService {
	constructor(private usersRepository: UsersRepository) {}

	findAll(): Promise<UserEntity[]> {
		return this.usersRepository.findAll();
	}

	async findById(id: string): Promise<UserEntity> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async findByEmail(email: string): Promise<{ email: string }> {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return { email: user.email };
	}

	async update(id: string, data: UpdateUserData): Promise<UserEntity> {
		await this.findById(id);
		return this.usersRepository.update(id, data);
	}

	async delete(id: string): Promise<UserEntity> {
		await this.findById(id);
		return this.usersRepository.delete(id);
	}
}
