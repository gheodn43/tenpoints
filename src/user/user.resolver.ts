import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, CreateUserInput } from './user.schema';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/authentication.guard';



@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }
  
  @UseGuards(AuthGuard)
  @Query(() => User)
  async getMe(@Context() context: any): Promise<User> {
    const userId = context.req.user.sub;
    return this.userService.getUserById(userId);
  }

}
