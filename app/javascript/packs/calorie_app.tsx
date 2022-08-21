// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import gql from 'graphql-tag'
import { ApolloProvider, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { isEmpty, groupBy, keys, filter } from 'lodash'
import { client, getApolloClient, isAuthed } from '../graphqlProvider'
import { AppBar, Avatar, Box, Button, Card, CardHeader, Chip, Fab, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListSubheader, Menu, Paper, Toolbar, Typography } from '@mui/material';
import { AddFoodEntryMutation, AddFoodEntryMutationVariables, GetAllFoodEntiesAndUserLimitsQuery, GetAllFoodEntiesAndUserLimitsQueryVariables, GetAllFoodEntiesQuery, GetAllFoodEntiesQueryVariables, GetAllUsersQuery, GetAllUsersQueryVariables, GetUserLimitsQuery, GetUserLimitsQueryVariables } from 'graphql/types';
import Login from './login';
import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import axios from "axios";
import styled from '@emotion/styled';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import CelebrationIcon from '@mui/icons-material/Celebration';
import NoFoodIcon from '@mui/icons-material/NoFood';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  const orderedFoodDates = keys(foodByDate).sort((d1, d2) => {
    return DateTime.fromFormat(d2, "MMM d, yyyy").toMillis() - DateTime.fromFormat(d1, "MMM d, yyyy").toMillis()
  })

  return (
    <div>
      <div>
        <Card variant="outlined" sx={{ m: 4, }}>
          {loading ? <div> Loading your limits </div> :
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                Daily Calorie Limit: {dailyCalorieLimit}
              </Typography>
              <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                Monthly Spending Limit: ${centsToMoney(monthlySpendingLimitInCents)}
              </Typography>
            </div>}
        </Card>
      </div>
      <Card variant="outlined" sx={{ m: 4, p: 4, mb: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>From:</label>
            <input type="date" id="start" ref={DateFromInputRef} max={toDate} onChange={handleFromDateChange} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>To:</label>
            <input type="date" id="end" min={fromDate} ref={DateToInputRef} onChange={handleToDateChange} />
          </div>

        </div>
      </Card>
      <List sx={{ mb: 2 }}>
        {orderedFoodDates.map((date) => {
          const foodEntriesOnDate = foodByDate[date]
          const totalCalorieOnDate = foodEntriesOnDate.reduce((prevVal, currVal) => prevVal + currVal.calories, 0)
          const exceedCalorieLimit = totalCalorieOnDate > dailyCalorieLimit

          return (<React.Fragment key={date}>
            <Card variant="outlined" sx={{ m: 4, }}>
              <ListSubheader sx={{ bgcolor: 'background.paper' }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  {exceedCalorieLimit ? <NoFoodIcon color='error' /> : <CelebrationIcon color="success" />}
                  <Chip label={exceedCalorieLimit ? "EXCEEDED LIMIT!" : "WITHIN LIMIT!"} sx={{ ml: 2 }} color={exceedCalorieLimit ? "error" : "success"} />
                  <Chip label={`${totalCalorieOnDate} total calories`} sx={{ ml: 2 }} color={exceedCalorieLimit ? "error" : "success"} />

                  <Box sx={{ flex: 1 }} />
                  <div>{date} </div>
                </div>
              </ListSubheader>
              <List sx={{ mb: 2 }}>
                <ListSubheader sx={{ bgcolor: 'background.paper' }}>
                  {foodEntriesOnDate.map((food, index) => {
                    return (
                      <div key={food.id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <div > {food.calories} calories - {food.name} (${centsToMoney(food.priceInCents)})</div>
                        <div>{DateTime.fromISO(food.createdAt).toLocaleString(DateTime.TIME_SIMPLE)}</div>
                      </div>
                    )
                  })}
                </ListSubheader>
              </List>
            </Card>
          </React.Fragment>
          )
        })}
      </List>
    </div>
  )
}

const AddFood = () => {
  const [addFoodEntry] = useMutation<AddFoodEntryMutation, AddFoodEntryMutationVariables>(addFoodEntryMutation)

  const { data, loading } = useQuery<GetAllFoodEntiesAndUserLimitsQuery, GetAllFoodEntiesAndUserLimitsQueryVariables>(foodsEntriesAndUserLimitsQuery)
  const priceInputRef = useRef(null)
  const calorieInputRef = useRef(null)
  const [priceInputValue, setPriceInputValue] = useState<number>(0)
  const [calorieInputValue, setCalorieInputValue] = useState<number>(0)

  const handleOnChangePrice = (e) => {
    //Prevent page reload
    e.preventDefault();

    const value = e.currentTarget.value
    setPriceInputValue(moneyToCents(value))
  }

  const handleOnChangeCalories = (e) => {
    //Prevent page reload
    e.preventDefault();

    const value = e.currentTarget.value
    setCalorieInputValue(Number(value))
  }

  if (loading) {
    return <span>Loading your spending data...</span>
  }

  const { foodEntries } = data
  const { user: { monthlySpendingLimitInCents, dailyCalorieLimit } } = data
  const currentMonth = DateTime.local().month
  const currentDay = DateTime.local().day
  const currentYear = DateTime.local().year
  const foodWithinCurrentMonth = filter(foodEntries, (entry) => {
    const createdAt = DateTime.fromISO(entry.createdAt)
    return createdAt.month == currentMonth && createdAt.year == currentYear
  })

  const foodEntriesOfToday = filter(foodEntries, (entry) => {
    const createdAt = DateTime.fromISO(entry.createdAt)
    return createdAt.month == currentMonth && createdAt.year == currentYear && createdAt.day == currentDay
  })
  const totalCaloriesConsumedToday = foodEntriesOfToday.reduce((prev, curr) => prev + curr.calories, 0)
  const overEaten = totalCaloriesConsumedToday > dailyCalorieLimit


  const totalSpendingForMonth = foodWithinCurrentMonth.reduce((prev, curr) => prev + curr.priceInCents, 0)
  const overBudget = totalSpendingForMonth > monthlySpendingLimitInCents
  const difference = monthlySpendingLimitInCents - totalSpendingForMonth
  const differenceMoney = centsToMoney(Math.abs(difference))

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

  const showOverBudgetWarning = overBudget
  const showAboutToBeOverBudget = !overBudget && !!priceInputValue && priceInputValue > difference
  const showOverEatenWarning = overEaten
  const showAboutToOverEat = !overEaten && (calorieInputValue + totalCaloriesConsumedToday > dailyCalorieLimit)

  return (
    <Card variant="outlined" sx={{ m: 4, }}>
      <div className="form" style={{ padding: 4 }}>
        <Card variant="outlined" sx={{ m: 4, }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
              Add Food Entry
            </Typography>
            {showOverBudgetWarning && <Chip label={"YOU ARE ALREADY OVER YOUR MONTHLY BUDGET!"} color="error" />}
            {showOverEatenWarning && <Chip label={"YOU ARE ALREADY OVER YOUR DAILY CALORIE LIMIT!"} color="error" />}
          </div>
          <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
            <div>This month, you have spent ${centsToMoney(totalSpendingForMonth)}. {overBudget ? `You are over budget by $${differenceMoney}` : `You have $${differenceMoney} left before your $${centsToMoney(monthlySpendingLimitInCents)}`} limit</div>
          </Typography>
          <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
            <div>Today, you consumed {totalCaloriesConsumedToday} calories. {overEaten ? `You have consumed more than your limit!` : `You have ${dailyCalorieLimit - totalCaloriesConsumedToday} left before your ${dailyCalorieLimit}`} limit</div>
          </Typography>
        </Card>
        <Card variant="outlined" sx={{ m: 4, }}>
          <form onSubmit={handleAddFoodEntry}>
            <div className="input-container">
              <label>Name </label>
              <input type="text" name="nameInput" required />
            </div>
            <div className="input-container">
              <label>Calories </label>
              <input type="number" name="caloriesInput" required ref={calorieInputRef} onChange={handleOnChangeCalories} />
            </div>
            {showAboutToOverEat && <Chip label="WITH THIS FOOD ENTRY YOU WILL GO OVER DAILY CALORIE LIMIT!" color="error" />}
            <div className="input-container">
              <label>Price (input 2.00 for $2.00) </label>
              <input type="number" name="priceInput" min="0.01" step="0.01" max="2500" required ref={priceInputRef} onChange={handleOnChangePrice} />
            </div>
            {showAboutToBeOverBudget && <Chip label="WITH THIS FOOD ENTRY YOU WILL GO OVER MONTHLY SPENDING BUDGET!" color="error" />}
            <div className="button-container">
              <input type="submit" />
            </div>
          </form>
        </Card>
      </div>
    </Card>
  )
}

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});


const App = () => {
  const previousAuthData = localStorage.getItem("auth") && JSON.parse(localStorage.getItem("auth"))
  const [authData, setAuthData] = useState(previousAuthData)
  const [currentView, setCurrentView] = useState<"FOOD_ENTRIES" | "ADD_FOOD">("FOOD_ENTRIES")

  const handleLogout = (event) => {
    //Prevent page reload
    event.preventDefault();

    axios.delete(
      '/auth/sign_out', {
      headers: {
        ...authData,
      },
    })
      .then(function (response) {
        setAuthData(response.headers)
        localStorage.removeItem("auth")
        window.location.reload()
      })
  }

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
    <Card>
      <Paper square sx={{ pb: '100px' }}>
        <Card variant="outlined" sx={{ m: 4, }}>
          <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
            Your Simple Calorie Tracker
          </Typography>
        </Card>
        {currentView == "FOOD_ENTRIES" && <FoodEntries />}
        {currentView == "ADD_FOOD" && <AddFood />}
      </Paper>
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar>
          <IconButton color="inherit">
            <LogoutIcon onClick={handleLogout} />
          </IconButton>

          <div onClick={() => {
            if (currentView == "FOOD_ENTRIES") {
              setCurrentView("ADD_FOOD")
              return
            }

            if (currentView == "ADD_FOOD") {
              setCurrentView("FOOD_ENTRIES")
              return
            }
          }} >
            <StyledFab color="secondary" aria-label="add">
              {currentView == "FOOD_ENTRIES" && <AddIcon />}
              {currentView == "ADD_FOOD" && <ArrowBackIcon />}
            </StyledFab>
          </div>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    </Card>
  </ApolloProvider >
}

const container = document.createElement('div')
document.body.appendChild(container)
const root = ReactDOMClient.createRoot(container);
root.render(<App />);
