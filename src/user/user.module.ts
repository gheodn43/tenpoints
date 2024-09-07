import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthGuard } from '../guard/authentication.guard';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/guard/role.guard';

@Module({
  imports: [JwtModule],
  providers: [UserResolver, UserService, AuthGuard, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
