const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')


const JWT_SECRET = 'salasana'

const MONGODB_URI = 'mongodb+srv://fullstack:fullstack@cluster0.93dq6.mongodb.net/library?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`

type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}

type Author {
  name: String
  born: String
  booksByAuthor: Int
  id: ID!
}

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int
    genres: [String]
  ): Book

  editAuthor(   
     name: String!    
     born: Int!  
     ): Author

  createUser(
    username: String!
    favoriteGenre: String!
  ): User

  login(
    username: String!
    password: String!
  ): Token   
}   

type Query {
  bookCount(author: String): Int!
  authorCount: Int!
  allBooks(author: String, genre: String): [Book]
  allAuthors: [Author!]
  me: User
  }

  type Subscription {
    bookAdded: Book!
  }


`
 const { PubSub } = require('apollo-server')
 const pubsub = new PubSub()
const resolvers = {
  Query: {
    me: (root, args, context) => { return context.currentUser },

    authorCount: () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {

      if (args.author && !args.genre) {  // annettu yksi parametri "author"
        author = await Author.findOne({ name: args.author });
        return Book.find({ author: author._id })

      }
      if (!args.author && args.genre) { //annettu yksi parametri "genre"
        return Book.find({ genres: { $in: [args.genre] } })
      }

      if (args.author && args.author) { //annettu kaksi parametria "author" ja "genre"
        author = await Author.findOne({ name: args.author })
        return Book.find({
          author: author._id, genres: { $in: [args.genre] },
        })
      }
      return Book.find({})     //ilman parametreja palautetaan kaikki kirjat
    },

    allAuthors: (root, args) => Author.find({})

  },
  Book: {
    author: (root) => {
      return {
        name: root.author,
        born: root.born
      }
    }
  },

  Author: {
    booksByAuthor: async author => {
      const a = await Author.findOne({ name: author.name })

      return a
        ? Book.collection.countDocuments({ author: { $eq: a._id } })
        : 0
    }
  },

  Mutation: {

    addBook: async (root, args, context) => {

      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
    
      if (!author) {
        author = new Author({ name: args.author })

        try {
          await author.save()
        } catch (error) {
          throw new UserInputError("Too short author name. Author name minlength 4")
        }
      }
     
      const book = new Book({ title: args.title, published: args.published, author: author._id, genres: args.genres })

      try {
        await book.save()
        
      } catch (error) {
        throw new UserInputError("Too short book title. Book title minlength 2")
      }

     
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
    },

  
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.born
      await author.save()

      return author
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username })
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError("Too short username. Username minlength 3")
      }
      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }

}


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
