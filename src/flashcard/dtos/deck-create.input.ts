import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDeckInput {

  @Field()
  deck_name: string;

  @Field()
  deck_path: string;

  @Field()
  deck_id: string;

  @Field()
  parent_deck_path: string;

  @Field()
  new_count: number;

  @Field()
  learning_count: number;

  @Field()
  review_count: number;

  @Field()
  total_cards: number;
}
