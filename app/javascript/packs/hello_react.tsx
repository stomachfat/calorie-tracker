// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import gql from 'graphql-tag'
import { ApolloProvider, useQuery } from '@apollo/client'
import { isEmpty } from 'lodash'
import { client } from '../graphqlProvider'

const usersQuery = gql`
  query getAllUsers {
    users {
      id
      name
    }
  }
`

type HelloProps = {
  name: string
}



const Hello = () => {
  // return <div>Testing</div>
  console.log("HERE1")
  const { data, loading, error } = useQuery(usersQuery)
  console.log("HERE2")
  if (loading) {
    console.log("HERE3")
    return <span>Loading...</span>
  }
  console.log("HERE4")

  const { users } = data

  if (isEmpty(users)) {
    return <div> sorry no users </div>
  }

  return (
    <div>
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
