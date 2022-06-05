// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import gql from 'graphql-tag'
import { ApolloProvider, useLazyQuery } from '@apollo/client'
import { isEmpty } from 'lodash'
import { client } from '../graphqlProvider'
import { Button } from '@mui/material';

const usersQuery = gql`
  query getAllUsers {
    users {
      id
      name
    }
  }
`



const Hello = () => {
  // return <div>Testing</div>
  console.log("HERE1")
  const [getUsers, { data, loading }] = useLazyQuery(usersQuery)

  if (!data) {
    return <div>
      <div className="text-3xl font-bold underline text-red-300">
        Hello world!
      </div>
      <Button variant="contained" color="primary" onClick={() => getUsers()}>
        Get users
      </Button>
    </div>
  }

  console.log("HERE2")
  if (loading) {
    console.log("HERE3")
    return <span>Loading...</span>
  }
  console.log("HERE4")

  const { users } = data

  if (isEmpty(users)) {
    return <div>
      <Button variant="contained" color="primary" onClick={() => getUsers()}>
        <div className="text-3xl font-bold underline text-red-300">
          Get Users
        </div>
      </Button>
      sorry no users
    </div>
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => getUsers()}>
        <div className="text-3xl font-bold underline text-red-300">
          Get Users
        </div>
      </Button>
      {users.map(user =>
        <div>{user.id} {user.name} </div>
      )}
    </div>
  )
}

const App = () => {
  return <ApolloProvider client={client}>
    <Hello />
  </ApolloProvider>
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <App />,
    document.body.appendChild(document.createElement('div')),
  )
})
