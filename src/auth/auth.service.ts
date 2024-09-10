import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Response } from 'express';
import { UserService } from '../user/user.service'
import { JwtService } from "@nestjs/jwt";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as bcrypt from 'bcrypt';
import { SecurityConfig } from "src/common/config/config.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
    constructor(
        @Inject('DYNAMODB_CLIENT')
        dynamoDBClient: DynamoDBClient,
        private userService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ){
        this.dynamoDBClient = dynamoDBClient;
    }
    private readonly dynamoDBClient: DynamoDBClient;
    async signIn(email: string, pass: string, res: Response) {
      if (!email || !pass) {
        throw new BadRequestException('Email and password must not be null or undefined');
      }
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Email does not exist or is incorrect');
      }
      
      const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }
    
      const { accessToken, refreshToken } = await this.generateTokens(user.user_id, user.name, user.role);
      await this.saveRefreshToken(user.user_id, refreshToken);
    
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.ENV === 'production', 
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    
      return { 
        accessToken,
        user_id: user.user_id,
        username: user.name,
        role: user.role,
      };
    }
    
    async generateTokens(user_id: string, username: string, role: string) {
        const payload = { sub: user_id, username: username, role: role};
        const payloadRT = { sub: user_id, username: username};
    
        const accessToken = this.jwtService.sign(payload);

        const securityConfig = this.configService.get<SecurityConfig>('security');
        const refreshToken = this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: securityConfig.refreshIn,
        });

        return {
          accessToken,
          refreshToken,
        };
    }
    async refreshAccessToken(refreshToken: string) {
          const { sub: userId, username: username, role: role} = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          });
          const tokenData = await this.getRefreshToken(userId);
          if (!tokenData || tokenData.refreshToken !== refreshToken) {
            console.log('Invalid refresh token');
            throw new UnauthorizedException('The account is already logged in elsewhere. Please log in again');
          }
          const now = new Date().toISOString();
          if (now > tokenData.expiresAt) {
            console.log('Refresh token expired');
            throw new UnauthorizedException('Login session has expired. Please log in again.');
          }
          const { accessToken } = await this.generateTokens(userId, username, role);
          return { accessToken };
      }

      // async checkRefreshToken(refreshToken: string){
      //   const { sub: userId} = this.jwtService.verify(refreshToken, {
      //     secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      //   });
      //   const tokenData = await this.getRefreshToken(userId);
      //   if (!tokenData || tokenData.refreshToken !== refreshToken) {
      //     console.log('Invalid refresh token');
      //     throw new UnauthorizedException('The account is already logged in elsewhere. Please log in again');
      //   }
      //   const now = new Date().toISOString();
      //   if (now > tokenData.expiresAt) {
      //     console.log('Refresh token expired');
      //     throw new UnauthorizedException('Login session has expired. Please log in again.');
      //   }
      // }
      

    async saveRefreshToken(userId: string, refreshToken: string) {
        const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 ngày sau
    
        const params = {
          TableName: 'tenpoint-users', 
          Key: marshall({ user_id: userId }),
          UpdateExpression: 'SET refresh_token = :refreshToken, refresh_token_expires_at = :expiresAt',
          ExpressionAttributeValues: marshall({
            ':refreshToken': refreshToken,
            ':expiresAt': refreshTokenExpiresAt,
          }),
        };
    
        await this.dynamoDBClient.send(new UpdateItemCommand(params));
    }

    async getRefreshToken(userId: string) {
        const params = {
            TableName: 'tenpoint-users',
            Key: {
                user_id: { S: userId },
            },
            ProjectionExpression: 'refresh_token, refresh_token_expires_at',
        };

        const command = new GetItemCommand(params);
        const result = await this.dynamoDBClient.send(command);

        if (!result.Item) return null;

        const item = unmarshall(result.Item);
        return {
            refreshToken: item.refresh_token,
            expiresAt: item.refresh_token_expires_at,
        };
    }
}