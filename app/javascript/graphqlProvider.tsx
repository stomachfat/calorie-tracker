import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from '@apollo/client'
import { isEmpty } from 'lodash'

const csrfToken = document
  .querySelector('meta[name=csrf-token]')
  .getAttribute('content')
console.log("csrfToken", csrfToken)

let authData = null

export const isAuthed = () => !isEmpty(authData)
export const setAuthData = (newAuthData) => {
  authData = newAuthData
}


export const client = new ApolloClient({
  link: new HttpLink({
    credentials: 'same-origin',
    headers: {
      'X-CSRF-Token': csrfToken,
      ...authData
      // "access-token": "wu9UZDn4g3PqGL3pWLUvwQ",
      // "token-type": "Bearer",
      // "client": "Vr53DC-8NRUSOnmegBYPSg",
      // "expiry": "1662070278",
      // "uid": "thamestruong@gmail.com",
      // "Authorization": "Bearer eyJhY2Nlc3MtdG9rZW4iOiJ3dTlVWkRuNGczUHFHTDNwV0xVdndRIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6IlZyNTNEQy04TlJVU09ubWVnQllQU2ciLCJleHBpcnkiOiIxNjYyMDcwMjc4IiwidWlkIjoidGhhbWVzdHJ1b25nQGdtYWlsLmNvbSJ9",
    },
  }),
  cache: new InMemoryCache(),
})

export const getApolloClient = headers => {
  return new ApolloClient({
    link: new HttpLink({
      credentials: 'same-origin',
      headers: {
        'X-CSRF-Token': csrfToken,
        ...headers,
        // "access-token": "wu9UZDn4g3PqGL3pWLUvwQ",
        // "token-type": "Bearer",
        // "client": "Vr53DC-8NRUSOnmegBYPSg",
        // "expiry": "1662070278",
        // "uid": "thamestruong@gmail.com",
        // "Authorization": "Bearer eyJhY2Nlc3MtdG9rZW4iOiJ3dTlVWkRuNGczUHFHTDNwV0xVdndRIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6IlZyNTNEQy04TlJVU09ubWVnQllQU2ciLCJleHBpcnkiOiIxNjYyMDcwMjc4IiwidWlkIjoidGhhbWVzdHJ1b25nQGdtYWlsLmNvbSJ9",
      },
    }),
    cache: new InMemoryCache(),
  })
}
