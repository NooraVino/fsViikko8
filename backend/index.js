const { ApolloServer, gql, UserInputError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

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

}

type Query {
  bookCount(author: String): Int!
  authorCount: Int!
  allBooks(author: String, genre: String): [Book]
  allAuthors: [Author!]
  }
`

const resolvers = {
  Query: {
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

    addBook: async (root, args) => {

      let author = await Author.findOne({ name: args.author })
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
      return book

    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.born
      await author.save()

      return author
    }
  }

}


const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
