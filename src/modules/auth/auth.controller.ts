import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private auth: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	register(@Body() dto: RegisterDto) {
		return this.auth.register(dto);
	}

	@Post('login')
	@HttpCode(200)
	@ApiOperation({ summary: 'Login and get access token' })
	login(@Body() dto: LoginDto) {
		return this.auth.login(dto);
	}
}
