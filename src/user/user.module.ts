// user.module.ts
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthGuard } from '../guard/authentication.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [UserResolver, UserService, AuthGuard],
  exports: [UserService],
})
export class UserModule {}
