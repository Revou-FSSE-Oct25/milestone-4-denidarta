import { IsOptional, IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	@Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
	email?: string;

	@IsOptional()
	@IsString()
	@Transform(({ value }: { value: string }) => value?.trim())
	name?: string;
}
