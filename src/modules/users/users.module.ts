import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
	imports: [AccountsModule],
	providers: [UsersService, UsersRepository, RolesGuard],
	controllers: [UsersController],
	exports: [UsersRepository],
})
export class UsersModule {}
