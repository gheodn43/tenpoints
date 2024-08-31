import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'


export const ErrorTypes = {
    REFRESH_TOKEN_IS_EXPIRED: {
        errorCode: 'REFRESH_TOKEN_IS_EXPIRED',
        errorStatus: 401,
    }
}


export const throwCustomError = (errorMessage: string, errorType: { errorCode: string; errorStatus: number }) => {
    throw new GraphQLError(errorMessage, {
        extensions: {
            code: errorType.errorCode,
            http: {
                status: errorType.errorStatus,
            },
        },
    });
};