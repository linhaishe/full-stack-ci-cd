import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/typeDefs';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import http from 'http';
// @ts-ignore
import { useServer } from 'graphql-ws/use/ws';
import User from './models/user';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';

mongoose.set('strictQuery', false);
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI!)
  .then(() => {
    console.log('connected success to MongoDB');
  })
  .catch((error: any) => {
    console.log('error connection to MongoDB:', error.message);
  });

mongoose.set('debug', true);

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET!
          );
          const currentUser = await User.findById(decodedToken?.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};

start();

// startStandaloneServer(server, {
//   listen: { port: 4000 },
//   // context: async ({ req, res }) => {
//   //   const auth = req ? req.headers.authorization : null;
//   //   if (auth && auth.startsWith('Bearer ')) {
//   //     const decodedToken = jwt.verify(
//   //       auth.substring(7),
//   //       process.env.JWT_SECRET
//   //     );
//   //     const currentUser = await User.findById(decodedToken.id).populate(
//   //       'friends'
//   //     );
//   //     return { currentUser };
//   //   }
//   // },
// }).then(({ url }) => {
//   console.log(`Server ready at ${url}`);
// });
