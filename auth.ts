// import NextAuth from "next-auth"
// import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
// import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
// import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
// import Sendgrid from "next-auth/providers/sendgrid"
//
// const config: DynamoDBClientConfig = {
//     credentials: {
//         accessKeyId: process.env.AUTH_DYNAMODB_ID,
//         secretAccessKey: process.env.AUTH_DYNAMODB_SECRET,
//     },
//     region: process.env.AUTH_DYNAMODB_REGION,
// }
//
// const client = DynamoDBDocument.from(new DynamoDB(config), {
//     marshallOptions: {
//         convertEmptyValues: true,
//         removeUndefinedValues: true,
//         convertClassInstanceToMap: true,
//     },
// })
//
// export const { handlers, auth, signIn, signOut } = NextAuth({
//     providers: [Sendgrid],
//     adapter: DynamoDBAdapter(client),
// })