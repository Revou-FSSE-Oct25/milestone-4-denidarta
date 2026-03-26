import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
	constructor(private users: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({ summary: 'Get all users (Admin only)' })
	findAll(@Request() req: { user: { role: UserRole } }) {
		if (req.user.role !== UserRole.ADMIN)
			throw new ForbiddenException(
				'You are not allowed to perform this action!'
			);
		return this.users.findAll();
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	@ApiOperation({ summary: 'Get current logged in user' })
	getMe(@Request() req: { user: { userId: string } }) {
		return this.users.findById(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiOperation({ summary: 'Update user by id' })
	update(
		@Param('id') id: string,
		@Body() dto: UpdateUserDto,
		@Request() req: { user: { userId: string; role: UserRole } }
	) {
		if (req.user.userId !== id && req.user.role !== UserRole.ADMIN) {
			throw new ForbiddenException('Forbidden Access');
		}
		return this.users.update(id, dto);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiOperation({ summary: 'Delete user by id (Admin only)' })
	delete(
		@Param('id') id: string,
		@Request() req: { user: { role: UserRole } }
	) {
		if (req.user.role !== UserRole.ADMIN)
			throw new ForbiddenException(
				'You are not allowed to perform this action!'
			);
		return this.users.delete(id);
	}
}
