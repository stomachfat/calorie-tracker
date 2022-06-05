import React from 'react'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from '@apollo/client'

const csrfToken = document
  .querySelector('meta[name=csrf-token]')
  .getAttribute('content')
console.log("csrfToken", csrfToken)

export const client = new ApolloClient({
  link: new HttpLink({
    credentials: 'same-origin',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  }),
  cache: new InMemoryCache(),
})
