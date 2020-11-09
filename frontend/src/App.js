
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import {useApolloClient } from '@apollo/client'

const Notify = ({ errorMessage }) => {
  if ( !errorMessage ) {
    return null
  }

  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>
  )
}


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

  if (!token) {
    
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('loginForm')}>kirjautumissivu</button>
        <Authors show={page === 'authors'} />
        <Books show={page === 'books'}/>
        <LoginForm show={page === 'loginForm'} setToken={setToken}setError={notify} />
      </div>
    )
  }


  return (
    <div>

      <div>
      <button onClick={() => setPage('authorsWithB')}>authors</button>
        <button onClick={logout} >logout</button>
        <Authors show={page === 'authorsWithB'} token={token} />
        <Notify errorMessage={errorMessage} />
        <Books show={page === 'books'}/>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

     


      

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App