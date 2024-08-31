import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  user_id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: String;

  @Field()
  role: String;
}

@InputType()
export class CreateUserInput {
  @Field()
  user_id: string;

  @Field()
  name: string;

  @Field()
  email: string;
  
  @Field()
  password: String;
}
