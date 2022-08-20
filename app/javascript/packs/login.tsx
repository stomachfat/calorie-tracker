import * as React from 'react';
import axios from "axios";
import "./login.css";

const Login = ({ setAuthData }: { setAuthData: (headers: any) => void }) => {
  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();

    const { emailInput, pass } = document.forms[0];

    const email = emailInput.value
    const password = pass.value

    axios.post('/auth/sign_in', {
      email: email,
      password,
    })
      .then(function (response) {
        setAuthData(response.headers)
      })
    // .catch(function (error) {
    //   console.log(error);
    // });
  };

  return (<div className="form">
    <form onSubmit={handleSubmit}>
      <div className="input-container">
        <label>Username </label>
        <input type="text" name="emailInput" required />
      </div>
      <div className="input-container">
        <label>Password </label>
        <input type="password" name="pass" required />
      </div>
      <div className="button-container">
        <input type="submit" />
      </div>
    </form>
  </div>)
}

export default Login