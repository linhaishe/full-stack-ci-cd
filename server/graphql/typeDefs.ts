export const typeDefs = `
  type User {
    username: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Subscription {
    bookAdded: Book!
  }
  
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
    allGenres: [String!]!
  }
  
  type Mutation { 
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    addAuthor(
      name: String!
      born: Int
    ): Author

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`;
