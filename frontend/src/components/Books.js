import React, { useState, useEffect } from 'react'
import {ALL_BOOKS} from '../queries'
import {useQuery, useLazyQuery } from '@apollo/client'


const Books = (props) => {
  const [filteredBooks, result] = useLazyQuery(ALL_BOOKS) 
  const [filter, setFilter] = useState([])
  const result2 = useQuery(ALL_BOOKS)
  
 
   useEffect(() => {
    if (result.data) {
      setFilter(result.data.allBooks)
      console.log(filter)
    }
   }, [result])
  
 
  if (filter.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const handleFilter = async (event, genre) => {
    event.preventDefault()
    filteredBooks({ variables: genre? { genre: genre } : {}})
    console.log(genre)
  }

  const books = result2.data.allBooks
 
  const genres = [...new Set(books.map(b => b.genres).flat())]
 
  
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filter.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres}</td>
            </tr>
          )}
        </tbody>
      </table>
    
    <div>
      <form>
        {genres.map((genre, index) => {
          return (
            <button
              key={index}
              name={genre}
              onClick={event => handleFilter(event, event.target.name)}>
              {genre}
            </button>
          )
        })}
        <button onClick={event => handleFilter(event, null)}>
          all genres
        </button>
      </form>
    </div>
  



    </div>
  )
}

export default Books