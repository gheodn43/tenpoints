import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Deck {
  @Field(() => String)
  user_id: string; // Partition key

  @Field(() => String)
  deck_path: string; // Sort key

  @Field(() => String)
  deck_id: string;

  @Field(() => String, { nullable: true })
  parent_deck_path?: string;

  @Field(() => String)
  deck_name: string;

  @Field(() => Int)
  new_count: number;

  @Field(() => Int)
  learning_count: number;

  @Field(() => Int)
  review_count: number;

  @Field(() => Int)
  total_cards: number;
}

@ObjectType()
export class DecksResponse {
  @Field(() => [Deck])
  decks: Deck[];
}
