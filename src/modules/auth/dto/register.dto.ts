import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	Matches,
	IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
	@ApiProperty({ example: 'john@example.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'Password@123' })
	@IsNotEmpty()
	@IsString()
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		{
			message:
				'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		}
	)
	password: string;

	@ApiProperty({ example: 'John Doe', required: false })
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;
}
