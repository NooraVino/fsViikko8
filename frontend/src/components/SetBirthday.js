import React, { useState } from 'react'
import Select from 'react-select'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useMutation } from '@apollo/client'


const SetBirthday = ({ authors }) => {
  const [author, setAuthor] = useState('')
  const [born, setBorn] = useState('')


  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })



  const submit = async (event) => {
    event.preventDefault()

    editAuthor({ variables: { name: author.name, born: parseInt(born) } })
    setAuthor('')
    setBorn('')
  }

  return (
    <div>
      <h2>set birthyear</h2>

      <form onSubmit={submit}>
        <div>
          <Select
            getOptionLabel={option => option.name}
            onChange={setAuthor}
            options={authors}
            isClearable={true}
            placeholder={"Select author.."}
          />
        </div>
        <div>
          born <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>edit author</button>
      </form>


    </div>
  )

}
export default SetBirthday