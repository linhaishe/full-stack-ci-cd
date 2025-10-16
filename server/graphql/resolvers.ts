// @ts-nocheck
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { v1 as uuid } from 'uuid';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import dotenv from 'dotenv';
import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

import Book from '../models/books';
import Author from '../models/authors';
import User from '../models/user';
import { TAddAuthorParams, TAddBookParams, TEditAuthorParams } from '../types';

const bookCountLoader = new DataLoader(async (authorIds) => {
  const counts = await Book.aggregate([
    { $match: { author: { $in: authorIds } } },
    { $group: { _id: '$author', count: { $sum: 1 } } },
  ]);

  const countMap = new Map();
  counts.forEach((c) => countMap.set(c._id.toString(), c.count));

  return authorIds.map((id) => countMap.get(id.toString()) || 0);
});

export const resolvers = {
  Query: {
    bookCount: async () => {
      console.log('bookCount.find');
      return Book.collection.countDocuments();
    },
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root: any, args: { author: string; genre: string }) => {
      if (args.author && args.genre) {
        const authorDoc = await Author.findOne({ name: args.author });
        return Book.find({
          author: authorDoc?._id,
          genres: { $in: [args.genre] },
        }).populate('author', 'name');
      } else if (args.author && !args.genre) {
        const authorDoc = await Author.findOne({ name: args.author });
        return Book.find({ author: authorDoc?._id }).populate('author', 'name');
      } else if (args.genre && !args.author) {
        return Book.find({ genres: { $in: [args.genre] } }).populate(
          'author',
          'name'
        );
      } else {
        return Book.find({}).populate('author', 'name');
      }
    },
    allAuthors: async () => {
      console.log('allAuthors.find');
      return Author.find({});
    },
    allGenres: async () => {
      const books = await Book.find({});
      const genres = books.flatMap((b) => b.genres);
      return [...new Set(genres)];
    },
  },

  Mutation: {
    addBook: async (root, args: TAddBookParams) => {
      try {
        let authorDoc = await Author.findOne({ name: args.author });
        if (!authorDoc) {
          authorDoc = new Author({ name: args.author });
          await authorDoc.save();
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: authorDoc._id,
        });

        const savedBook = await book.save();
        await savedBook.populate('author', 'name');

        pubsub.publish('BOOK_ADDED', { bookAdded: savedBook });

        return savedBook;
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_BOOK_INPUT',
            invalidArgs: null,
            error,
          },
        });
      }
    },

    addAuthor: async (root: any, args: TAddAuthorParams) => {
      try {
        const author = new Author({ ...args });
        await author.save();
        return author;
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_AUTHOR_INPUT',
            invalidArgs: null,
            error,
          },
        });
      }
    },

    editAuthor: async (root: any, args: TEditAuthorParams) => {
      try {
        const authorDoc = await Author.findOne({ name: args.name });
        if (!authorDoc) {
          throw new GraphQLError('Editing AUTHOR failed', {
            extensions: {
              code: 'AUTHOR_NOT_FOUND',
            },
          });
        } else {
          authorDoc.born = args.setBornTo;
          await authorDoc.save();
          return authorDoc;
        }
      } catch (error) {
        throw new GraphQLError('Editing author born failed', {
          extensions: {
            code: 'BAD_AUTHOR_INPUT',
            invalidArgs: null,
            error,
          },
        });
      }
    },

    createUser: async (root, args: { username: string }) => {
      const user = new User({ username: args.username });

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args: { username: string; password: string }) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET!) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => {
        console.log('客户端订阅 bookAdded 成功', new Date());
        return pubsub.asyncIterableIterator('BOOK_ADDED');
      },
    },
  },

  Author: {
    // bookCount: async (root) => {
    //   console.log('counting books for', root.name);
    //   return await Book.countDocuments({ author: root._id }); // 每个作者查一次 → N
    // },
    bookCount: (root) => {
      console.log('counting books for', root.name);
      return bookCountLoader.load(root._id);
    },
  },
};
