import { DynamoDBClient, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { Inject, Injectable } from "@nestjs/common";
import { DecksResponse, Deck } from "./dtos/decks-response.dto";
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class DeckService {
    private readonly dynamoDBClient: DynamoDBClient;

    constructor(
        @Inject('DYNAMODB_CLIENT')
        dynamoDBClient: DynamoDBClient
    ) {
        this.dynamoDBClient = dynamoDBClient;
    }

    async getDecksByUserId(user_id: string): Promise<DecksResponse> {
        const params: QueryCommandInput = {
            TableName: 'tenpoint-deck',
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
                ':user_id': { S: user_id },
            },
        };

        const command = new QueryCommand(params);
        const result = await this.dynamoDBClient.send(command);

        if (!result.Items || result.Items.length === 0) {
            const defaultDeck: Deck = {
                user_id: user_id,
                deck_path: "default",
                deck_id: uuidv4(),
                parent_deck_path: null,
                deck_name: "default",
                new_count: 0,
                learning_count: 0,
                review_count: 0,
                total_cards: 0,
            };
            return { decks: [defaultDeck] };
        }
        const decks = result.Items?.map((item) => ({
            user_id: item.user_id.S,
            deck_path: item.deck_path.S,
            deck_id: item.deck_id.S,
            parent_deck_path: item.parent_deck_path?.S,
            deck_name: item.deck_name.S,
            new_count: parseInt(item.new_count.N),
            learning_count: parseInt(item.learning_count.N),
            review_count: parseInt(item.review_count.N),
            total_cards: parseInt(item.total_cards.N),
        })) as Deck[];

        return { decks };
    }
}
