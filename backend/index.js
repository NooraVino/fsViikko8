const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

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

        await author.save();

      }

      const book = new Book({ title: args.title, published: args.published, author: author._id, genres: args.genres })

      return book.save()

    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.born
      return author.save()
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
