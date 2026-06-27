import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from "@mui/material/Alert"
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),

  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

export default function SignInCard() {
  const navigate=useNavigate("");

  const [formState, setFormState] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [open,setOpen]=useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");

  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  let {handleRegister,handleLogin}=useContext(AuthContext);




  let handleAuth=async()=>{
    try{
      if( formState===0){
        let result=await handleLogin(username,password);
        setMessage(result);
        setOpen(true);

        navigate("/home")
      }
      if(formState===1){
        let result=await handleRegister(name,username,password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setFormState(0);
        setUsername("");
        setPassword("");
      }
    }catch(err){
      let error=(err.response.data.message);
      setMessage(error);
      setOpen(true);
    }
  }
  const validateInputs = () => {

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage(
        "Username must be at least 3 characters long."
      );
      isValid = false;
    }
    else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 6 characters long."
      );
      isValid = false;
    }
    else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (formState === 1) {
      if (!name || name.length < 3) {
        alert("Please enter a valid full name");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    try {

      if (formState === 0) {

        console.log("LOGIN");

        console.log({
          username,
          password
        });

        // login api call here

      }
      else {

        console.log("REGISTER");

        console.log({
          name,
          username,
          password
        });

        // register api call here

      }

    }
    catch (err) {
      console.log(err);
    }
  };

  return (
    <Card variant="outlined">

      <div
        style={{
          display: "flex",
          gap: "10px"
        }}
      >
        <Button
          variant={formState === 0 ? "contained" : "outlined"}
          onClick={() => setFormState(0)}
        >
          Sign In
        </Button>

        <Button
          variant={formState === 1 ? "contained" : "outlined"}
          onClick={() => setFormState(1)}
        >
          Sign Up
        </Button>
      </div>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 2
        }}
      >

        {formState === 1 && (
          <FormControl>
            <FormLabel htmlFor="fullname">
              Full Name
            </FormLabel>

            <TextField
              id="fullname"
              type="text"
              placeholder="Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel htmlFor="username">
            Username
          </FormLabel>

          <TextField
            id="username"
            type="text"
            placeholder="Username"
            required
            fullWidth
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            error={usernameError}
            helperText={usernameErrorMessage}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password">
            Password
          </FormLabel>

          <TextField
            id="password"
            type="password"
            placeholder="••••••"
            required
            fullWidth
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            error={passwordError}
            helperText={passwordErrorMessage}
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          onClick={handleAuth}
        >
          {formState === 0
            ? "Sign In"
            : "Register"}
        </Button>

      </Box>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setOpen(false)}
        >
        {message}
      </Alert>
      </Snackbar>
    </Card>
  
  );
}





















