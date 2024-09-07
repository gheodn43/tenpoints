import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { DeckService } from './deck.service';
import { DecksResponse, Deck } from './dtos/decks-response.dto';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/guard/role.guard';
import { AuthGuard } from 'src/guard/authentication.guard';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/common/decorator/role.decorator';

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
}
