// declare module '@apollo/server/express4' {
//   import type { ApolloServer } from '@apollo/server';
//   import type { RequestHandler } from 'express';

//   interface ExpressMiddlewareOptions<TContext = any> {
//     context?: (args: {
//       req: import('express').Request;
//       res: import('express').Response;
//     }) => Promise<TContext> | TContext;
//   }

//   export function expressMiddleware(
//     server: ApolloServer,
//     options?: ExpressMiddlewareOptions
//   ): RequestHandler;
// }
