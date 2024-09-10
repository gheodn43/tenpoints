// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from './auth.service';
// import { AuthResolver } from './auth.controller';
// import { jwtConstants } from './constants';
// import { UserModule } from '../user/user.module';

// @Module({
//   imports: [
//     UserModule,
//     JwtModule.register({
//         global: true,
//         secret: jwtConstants.secret,
//         signOptions: { expiresIn: '10s' },
//       }),
//   ],
//   providers: [AuthService, AuthResolver],
//   controllers: [],
//   exports: [AuthService],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SecurityConfig } from 'src/common/config/config.interface';
import { AuthGuard } from 'src/guard/authentication.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {         
          expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, AuthGuard],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}


