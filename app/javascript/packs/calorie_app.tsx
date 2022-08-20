// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import gql from 'graphql-tag'
import { ApolloProvider, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { isEmpty, groupBy, keys, filter } from 'lodash'
import { client, getApolloClient, isAuthed } from '../graphqlProvider'
import { Button } from '@mui/material';
import { AddFoodEntryMutation, AddFoodEntryMutationVariables, GetAllFoodEntiesAndUserLimitsQuery, GetAllFoodEntiesAndUserLimitsQueryVariables, GetAllFoodEntiesQuery, GetAllFoodEntiesQueryVariables, GetAllUsersQuery, GetAllUsersQueryVariables, GetUserLimitsQuery, GetUserLimitsQueryVariables } from 'graphql/types';
import Login from './login';
import { useRef, useState } from 'react';
import { DateTime } from 'luxon';

const usersQuery = gql`
  query getAllUsers {
    users {
      id
      email
      userName
      fullName
    }
  }
`

const foodsEntriesQuery = gql`
  query getAllFoodEnties {
    foodEntries {
      id 
      __typename
      name
      calories
      priceInCents
      createdAt
    }
  }
`

const addFoodEntryMutation = gql`
  mutation AddFoodEntry($name: String!, $calories: Int!, $priceInCents: Int!) {
    addFoodEntry(input: {
      name: $name,
      calories: $calories,
      priceInCents: $priceInCents,
    }) {
      id 
      __typename
      name
      calories
      priceInCents
      createdAt
    }
  }
`

const getUserLimits = gql`
  query getUserLimits {
    user {
      id
      dailyCalorieLimit
      monthlySpendingLimitInCents
    }
  } 
`

const moneyToCents = (amount: string): number => {
  return Math.round(100 * parseFloat(amount.replace(/[$,]/g, '')))
}

const centsToMoney = (cents: number): string => {
  return (cents / 100).toFixed(2)
}



const Users = () => {
  const [getUsers, { data, loading }] = useLazyQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(usersQuery)

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

  if (loading) {
    return <span>Loading...</span>
  }

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
        <div key={user.id}>{user.id} {user.fullName} {user.email} {user.userName} </div>
      )}
    </div>
  )
}



const foodsEntriesAndUserLimitsQuery = gql`
  query getAllFoodEntiesAndUserLimits {
    foodEntries {
      id 
      __typename
      name
      calories
      priceInCents
      createdAt
    }
    user {
      id
      dailyCalorieLimit
      monthlySpendingLimitInCents
    }
  }
`



const FoodEntries = () => {
  const { data, loading } = useQuery<GetAllFoodEntiesAndUserLimitsQuery, GetAllFoodEntiesAndUserLimitsQueryVariables>(foodsEntriesAndUserLimitsQuery)

  const DateFromInputRef = useRef();
  const DateToInputRef = useRef();
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  const handleFromDateChange = (e) => {
    setFromDate(e.currentTarget.value)
  }

  const handleToDateChange = (e) => {
    setToDate(e.currentTarget.value)
  }

  if (loading) {
    return <span>Loading Your Food Entries and Limits...</span>
  }

  if (!data) {
    return <span> No Food Data</span>
  }

  const { foodEntries } = data
  const { user: { dailyCalorieLimit, monthlySpendingLimitInCents } } = data

  const applyFilter = fromDate && toDate
  const filteredFoodEntries = !applyFilter ? foodEntries : filter(foodEntries, (entry) => {

    const fromDateLuxon = DateTime.local(...fromDate.split("-").map(Number)).startOf('day');
    const toDateLuxon = DateTime.local(...toDate.split("-").map(Number)).endOf('day')
    const entryCreatedAt = DateTime.fromISO(entry.createdAt)

    const withinDates = fromDateLuxon <= entryCreatedAt && entryCreatedAt <= toDateLuxon

    return withinDates
  })

  const foodByDate = groupBy(filteredFoodEntries, (food) => {
    return DateTime.fromISO(food.createdAt).toLocaleString(DateTime.DATE_MED)
  })

  return (
    <div>
      <div>
        <span>
          Your Limits
        </span>
        {loading ? <div> Loading your limits </div> :
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              Your Daily Calorie Limit: {dailyCalorieLimit}
            </span>
            <span>
              Your Monthly Spending Limit: {centsToMoney(monthlySpendingLimitInCents)}
            </span>
          </div>}
      </div>
      <span>Your food entries!</span>
      {keys(foodByDate).map((date) => {
        const foodEntriesOnDate = foodByDate[date]
        const totalCalorieOnDate = foodEntriesOnDate.reduce((prevVal, currVal) => prevVal + currVal.calories, 0)
        const exceedCalorieLimit = totalCalorieOnDate > dailyCalorieLimit

        return <div key={date}>
          <span>{date} Total calorie counts: {totalCalorieOnDate}, {exceedCalorieLimit ? "EXCEED LIMIT!" : "WITHIN LIMIT!"}</span>
          {foodEntriesOnDate.map((food, index) => {
            return (
              <div key={food.id}>{index + 1}. {DateTime.fromISO(food.createdAt).toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET)} {food.name}, {food.calories} calories, ${centsToMoney(food.priceInCents)} </div>
            )
          })}
        </div>
      })}
      <div>
        <div> filter</div>
        <label>From:</label>
        <input type="date" id="start" ref={DateFromInputRef} max={toDate} onChange={handleFromDateChange} />

        <label>To:</label>
        <input type="date" id="end" min={fromDate} ref={DateToInputRef} onChange={handleToDateChange} />

      </div>

    </div>
  )
}

const AddFood = () => {
  const [addFoodEntry, { loading }] = useMutation<AddFoodEntryMutation, AddFoodEntryMutationVariables>(addFoodEntryMutation)

  const handleAddFoodEntry = (event) => {
    //Prevent page reload
    event.preventDefault();

    const { nameInput, caloriesInput, priceInput } = document.forms[0];

    const name = nameInput.value
    const calories = parseInt(caloriesInput.value)
    const priceInCents = moneyToCents(priceInput.value)

    addFoodEntry({
      variables: {
        name,
        calories,
        priceInCents,
      }
    }).then(() => {
      window.location.reload();
    })
  };

  if (loading) {
    <span> Adding your food entry...!</span>
  }

  return <div className="form">
    <div>Add Food Entry</div>
    <form onSubmit={handleAddFoodEntry}>
      <div className="input-container">
        <label>Name </label>
        <input type="text" name="nameInput" required />
      </div>
      <div className="input-container">
        <label>Calories </label>
        <input type="number" name="caloriesInput" required />
      </div>
      <div className="input-container">
        <label>Price (e.g. 2.00) </label>
        <input type="number" name="priceInput" min="0.01" step="0.01" max="2500" required />
      </div>
      <div className="button-container">
        <input type="submit" />
      </div>
    </form>
  </div>
}

const MonthlySpending = () => {
  const { data, loading } = useQuery<GetAllFoodEntiesAndUserLimitsQuery, GetAllFoodEntiesAndUserLimitsQueryVariables>(foodsEntriesAndUserLimitsQuery)

  if (loading) {
    return <span>Loading your spending data...</span>
  }

  const { foodEntries } = data
  const { user: { monthlySpendingLimitInCents } } = data
  const currentMonth = DateTime.local().month
  const foodWithinCurrentMonth = filter(foodEntries, (entry) => DateTime.fromISO(entry.createdAt).month == currentMonth)

  const totalSpendingForMonth = foodWithinCurrentMonth.reduce((prev, curr) => prev + curr.priceInCents, 0)
  const overBudget = totalSpendingForMonth > monthlySpendingLimitInCents
  const difference = centsToMoney(Math.abs(monthlySpendingLimitInCents - totalSpendingForMonth))

  return <div>You have spent ${centsToMoney(totalSpendingForMonth)}! {overBudget ? `You are over budget by $${difference}` : `You have $${difference} left before your $${centsToMoney(monthlySpendingLimitInCents)}`} limit</div>
}

const App = () => {
  const previousAuthData = localStorage.getItem("auth") && JSON.parse(localStorage.getItem("auth"))
  const [authData, setAuthData] = useState(previousAuthData)

  if (isEmpty(authData)) {
    return <Login setAuthData={(args) => {
      const authHeaders = {
        'access-token': args["access-token"],
        'authorization': args["authorization"],
        'token-type': args["token-type"],
        'uid': args["uid"],
        client: args["client"],
      }

      localStorage.setItem("auth", JSON.stringify(authHeaders))
      setAuthData(authHeaders)
    }} />
  }

  return <ApolloProvider client={getApolloClient(authData)}>
    {/* <Users /> */}
    <FoodEntries />
    <AddFood />
    <MonthlySpending />
  </ApolloProvider>
}

const container = document.createElement('div')
document.body.appendChild(container)
const root = ReactDOMClient.createRoot(container);
root.render(<App />);
