import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, CreateUserInput } from './user.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/authentication.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/enum/role.enum';



@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }
  
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Free, Role.Premium)
  @Query(() => User)
  async getMe(@Context() context: any): Promise<User> {
    const userId = context.req.user.sub;
    return this.userService.getUserById(userId);
  }

}
