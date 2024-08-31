import { Injectable, Inject, UseGuards, NotFoundException } from '@nestjs/common';
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand} from '@aws-sdk/client-dynamodb';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './user.schema';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class UserService {
  private readonly dynamoDBClient: DynamoDBClient;
  private readonly saltRounds = 10;
  constructor(
    @Inject('DYNAMODB_CLIENT')
    dynamoDBClient: DynamoDBClient,
  ) {
    this.dynamoDBClient = dynamoDBClient;
  }

  async createUser(input: CreateUserInput): Promise<any> {
    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);
    const defaultRole = 'free'
    const params = {
      TableName: 'tenpoint-users',
      Item: {
        user_id: { S: input.user_id },
        name: { S: input.name },
        email: { S: input.email },
        password: { S: hashedPassword},
        role: { S: defaultRole},
      },
    };
    const command = new PutItemCommand(params);
    await this.dynamoDBClient.send(command);
    return input;
  }

  async getUserById(user_id: string): Promise<any> {
    const params = {
      TableName: 'tenpoint-users',
      Key: {
        user_id: { S: user_id },
      },
    };
    const command = new GetItemCommand(params);
    const result = await this.dynamoDBClient.send(command);
    if (!result.Item) {
      throw new NotFoundException('User not found');
    }
    return {
      user_id: result.Item.user_id.S,
      name: result.Item.name.S,
      email: result.Item.email.S,
    };
  }

  async getUserByEmail(email: string): Promise<any> {
    const params = {
      TableName: 'tenpoint-users',
      IndexName: 'EmailIndex', // Tên chỉ mục phụ
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    };
    const command = new QueryCommand(params);
    const result = await this.dynamoDBClient.send(command);
    if (result.Items.length === 0) {
      throw new NotFoundException('User not found');
    }
    const user = result.Items[0];
    return {
      user_id: user.user_id.S,
      name: user.name.S,
      email: user.email.S,
      password: user.password.S,
      role: user.role.S,
    };
  }
}
