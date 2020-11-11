
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Notify from './components/Notify'
import {BOOK_ADDED} from './queries'

import {useQuery, useMutation, useSubscription, useApolloClient} from '@apollo/client'


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      notify(`${addedBook.title} added`)
      
    }
  })

  if (!token) {

    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('loginForm')}>login</button>
        <Authors show={page === 'authors'} />
        <Books show={page === 'books'}  />
        <LoginForm show={page === 'loginForm'} setToken={setToken} setError={notify} />
      </div>
    )
  }


  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <button onClick={logout} >logout</button>
      <button onClick={() => setPage('authors')}>authors</button>  
      <button onClick={() => setPage('books')}>books</button>
      <button onClick={() => setPage('add')}>add book</button> 
      <Authors show={page === 'authors'} token={token} />  
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} setError={notify} />
    </div>
  )
}

export default App