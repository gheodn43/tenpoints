import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DeckResolver } from "./deck.resolver";
import { DeckService } from "./deck.service";
import { AuthGuard } from "src/guard/authentication.guard";
import { RolesGuard } from "src/guard/role.guard";

@Module({
    imports: [JwtModule],
    providers: [DeckResolver, DeckService,  AuthGuard, RolesGuard],

})
export class FlashcardModule {}