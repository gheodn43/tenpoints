import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { DeckService } from './deck.service';
import { DecksResponse, Deck } from './dtos/decks.output';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/guard/role.guard';
import { AuthGuard } from 'src/guard/authentication.guard';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/common/decorator/role.decorator';
import { CreateDeckInput } from './dtos/deck-create.input';

@Resolver(() => Deck)
export class DeckResolver {
  constructor(private readonly deckService: DeckService) {}
  
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Free, Role.Premium)
  @Query(() => DecksResponse)
  async getDecksByUserId(@Context() context: any): Promise<DecksResponse> {
    const userId = context.req.user.sub;
    return this.deckService.getDecksByUserId(userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Free, Role.Premium)
  @Mutation(() => Boolean)
  async createDeck(
    @Args('createDeckInput') createDeckInput: CreateDeckInput,
    @Context() context: any,
  ): Promise<Boolean> {
    const userId = context.req.user.sub;
    return this.deckService.createDeck(userId, createDeckInput);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Free, Role.Premium)
  @Mutation(() => Boolean)
  async deleteDeck(
    @Args('deck_id') deck_id: string,
    @Context() context: any,
  ): Promise<Boolean> {
    const userId = context.req.user.sub;
    return this.deckService.deleteDeck(userId, deck_id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Free, Role.Premium)
  @Mutation(() => Boolean)
  async updateDeck(
    @Args('updatedDeckInput') updatedDeckInput: CreateDeckInput,
    @Context() context: any,
  ): Promise<Boolean> {
    const userId = context.req.user.sub;
    return this.deckService.updateDeck(userId, updatedDeckInput);
  }
}
