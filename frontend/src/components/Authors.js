  
import React from 'react'
import {ALL_AUTHORS} from '../queries'
import {useQuery } from '@apollo/client'
import SetBirthday from './SetBirthday'

const Authors = ({show, token}) => {
  const result = useQuery(ALL_AUTHORS)

 if (result.loading) {
   return <div>loading...</div>
 }
 
  if (!show) {
    return null
  }
 const authors = result.data.allAuthors

if (token) {
  console.log(token)
  return (
    <div>
      <SetBirthday authors={authors} />
      <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.booksByAuthor}</td>
            </tr>
          )}
        </tbody>
      </table>
  
    </div>

      </div>
    
    
  )
}

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.booksByAuthor}</td>
            </tr>
          )}
        </tbody>
      </table>
  
    </div>
  )
}

export default Authors
