import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './auth.schema';
import { RefreshTokenResponse } from './dtos/refresh-token-response.dto';
import { checkAuthResponse } from './dtos/check-auth-response.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/guard/authentication.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AuthResolver {

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Mutation(() => AuthResponse) 
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    const { accessToken, user_id, username, role } = await this.authService.signIn(email, password, context.res);
    return {
      access_token: accessToken,
      user_id: user_id,
      username: username,
      role: role,
    };
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshAccessToken(@Context() context): Promise<RefreshTokenResponse> {
    const refreshToken = context.req.cookies['refreshToken'];
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Mutation(() => Boolean)
  async logout(@Context() context): Promise<boolean> {
    try {
      context.res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false, 
        sameSite: 'strict',
        path: '/' 
    });
      return true;
    } catch (error) {
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @Query(() => Boolean)
  async isAuthorizated(@Context() context: any): Promise<Boolean> {
    return true;
  }

  @Query(() => checkAuthResponse)
  async isAuthenticated(@Context() context): Promise<checkAuthResponse> {
    const refreshToken = context.req.cookies['refreshToken'];
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        const { username } = payload;
        if (username) {
          return {
            is_authenticated: true,
            username: username || null,
          };
        }
      } catch (error) {
        console.error('Token validation error:', error);
      }
    }
    return {
      is_authenticated: false,
      username: null,
    };
  }
}
