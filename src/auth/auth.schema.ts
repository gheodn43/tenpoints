import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;
  
  @Field()
  user_id: string;

  @Field()
  username: string;

  @Field()
  role: string;

}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
