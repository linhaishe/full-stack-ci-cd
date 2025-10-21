import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/typeDefs';
import User from './models/user';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

// 读取配置
dotenv.config();
mongoose.set('strictQuery', false);
const MONGODB_URI = process.env.MONGODB_URI!;
console.log('connecting to', MONGODB_URI);

// 连接数据库
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected success to MongoDB');
  })
  .catch((error: any) => {
    console.log('error connection to MongoDB:', error.message);
  });

mongoose.set('debug', true);

export const createApolloServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({ server: httpServer, path: '/' });

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

  // Ensure the server is started before middleware is applied
  await server.start();

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET!);
          const currentUser = await User.findById(decodedToken?.id);
          return { currentUser };
        }
      },
    })
  );

  return app;  // 返回Express应用实例
};
