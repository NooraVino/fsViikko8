import { gql} from '@apollo/client'

export const ALL_AUTHORS = gql`
{ 
   allAuthors {
     name,
     born,
     booksByAuthor
   }
  }
`
export const ALL_BOOKS = gql`
{
  allBooks {
    title,
    published,
    author{
      name
    }
  }
}
`
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String]) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      published
      author {
        name
      },
      genres
    }
  }
`
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born) {
   name
   born
  }
}
`