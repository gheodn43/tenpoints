import { DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { Inject, Injectable } from "@nestjs/common";
import { DecksResponse, Deck } from "./dtos/decks.output";
import { CreateDeckInput } from './dtos/deck-create.input';
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

    async createDeck(user_id: string, deck: CreateDeckInput): Promise<boolean> {
        const params: PutItemCommandInput = {
            TableName: 'tenpoint-deck',
            Item: {
                'user_id': { S: user_id},
                'deck_id': { S: deck.deck_id || uuidv4() },
                'deck_path': { S: deck.deck_path },
                'parent_deck_path': deck.parent_deck_path ? { S: deck.parent_deck_path } : { NULL: true },
                'deck_name': { S: deck.deck_name },
                'new_count': { N: deck.new_count.toString() },
                'learning_count': { N: deck.learning_count.toString() },
                'review_count': { N: deck.review_count.toString() },
                'total_cards': { N: deck.total_cards.toString() },
            },
        };
        try {
            const command = new PutItemCommand(params);
            await this.dynamoDBClient.send(command);
            return true;
        } catch (error) {
            console.error('Error creating deck:', error);
            return false;
        }
    }

    async deleteDeck(user_id: string, deck_id: string): Promise<boolean> {
        const params: DeleteItemCommandInput = {
            TableName: 'tenpoint-deck',
            Key: {
                'user_id': { S: user_id }, // partition key
                'deck_id': { S: deck_id }, // sort key
            },
        };

        try {
            const command = new DeleteItemCommand(params);
            await this.dynamoDBClient.send(command);
            return true;
        } catch (error) {
            console.error('Error deleting deck:', error);
            return false;
        }
    }

    async updateDeck(user_id: string, updatedDeck: CreateDeckInput): Promise<boolean> {
        const params: UpdateItemCommandInput = {
            TableName: 'tenpoint-deck',
            Key: {
                'user_id': { S: user_id },  // Partition key
                'deck_id': { S: updatedDeck.deck_id },  // Sort key
            },
            UpdateExpression: 'SET deck_name = :deck_name, deck_path = :deck_path, parent_deck_path = :parent_deck_path, new_count = :new_count, learning_count = :learning_count, review_count = :review_count, total_cards = :total_cards',
            ExpressionAttributeValues: {
                ':deck_name': { S: updatedDeck.deck_name },
                ':deck_path': { S: updatedDeck.deck_path },
                ':parent_deck_path': { S: updatedDeck.parent_deck_path },
                ':new_count': { N: updatedDeck.new_count.toString() },
                ':learning_count': { N: updatedDeck.learning_count.toString() },
                ':review_count': { N: updatedDeck.review_count.toString() },
                ':total_cards': { N: updatedDeck.total_cards.toString() },
            },
            ReturnValues: 'UPDATED_NEW', // Optional, returns the updated attributes
        };

        try {
            const command = new UpdateItemCommand(params);
            await this.dynamoDBClient.send(command);
            return true;
        } catch (error) {
            console.error('Error updating deck:', error);
            return false;
        }
    }
}
