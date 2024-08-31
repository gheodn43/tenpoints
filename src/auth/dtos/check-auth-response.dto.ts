import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class checkAuthResponse {
  @Field()
  is_authenticated: boolean;

  @Field({ nullable: true })
  username: string;
}
