import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
	@ApiProperty({ example: 'Savings Account' })
	@IsString()
	name: string;

	@ApiProperty({ example: 1234567890 })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	accountNumber: number;
}
