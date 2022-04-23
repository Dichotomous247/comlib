import './Authenticator.css';
import firebase from './firebase';
import React,{useState} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { Box, Divider } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Container from 'react-bootstrap/Container'

const jwt = require('jsonwebtoken');

const useStyles = makeStyles((theme) => ({
  govHeader: {
    borderBottom: '2px solid #fcba19'
  },
  govHeaderContainer: {
    paddingLeft: 0,
    paddingRight: 0
  },
  govHeaderToolbar: {
    height: '70px'
  },
  spacingRight:{
    paddingRight: '4rem'
  },
  spacingRightSmall:{
    paddingRight: '2rem'
  },
  hand:{
    cursor:"pointer"
  },
  bold:{
    fontWeight: 'bold'
  }
}));

function Authenticator(props) {
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const classes = useStyles();
  const [showVerificationField, setShowVerificationField] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showNameField, setShowNameField] = useState(false);
  const [name, setName] = useState("");

  const database = firebase.database()

  const completeSignup = async()=>{
    await database.ref(`users/+${localPhoneNumber}/profile`).set({
      phoneNumber:localPhoneNumber,
      name
    })
    props.setPhoneNumber(`+${localPhoneNumber}`);
    props.setIsAuthed(true);
  }

  function onSignInSubmit (event) {
    event.preventDefault();
    firebase.setupRecaptcha();

    console.log(localPhoneNumber)

    const appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(`+${localPhoneNumber}`, appVerifier)
    .then((confirmationResult) => {
      console.log(confirmationResult)
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).

      
      window.confirmationResult = confirmationResult;
  
      setShowVerificationField(true);

    }).catch((error) => {
      // Error; SMS not sent
      // ...
    });
  }

  firebase.setupRecaptcha = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': "invisible",
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    });
  }

  const verificationConfirmation = async () => {
      window.confirmationResult.confirm(verificationCode).then(async (result) => {
        // User signed in successfully.
        const token = jwt.sign({ phoneNumber: `+${localPhoneNumber}` }, 'secret');

        window.sessionStorage.setItem('jwt', token)

        let resultExists; 
        await database.ref(`users/+${localPhoneNumber}`).once('value', (snapshot) => {
          resultExists = snapshot.val()
        })
        console.log(resultExists);
        if(!resultExists){
          setShowNameField(true);

          return;
        }
        // await database.ref(`users/+${localPhoneNumber}`).on('value', async (snapshot) => {
        //   console.log(snapshot.val())
        //   if(!snapshot.val()){
            // await database.ref(`users/+${localPhoneNumber}/profile`).push({
            //   phoneNumber:localPhoneNumber
            // })
        //   }
        // })
        props.setPhoneNumber(`+${localPhoneNumber}`);
        props.setIsAuthed(true);
      }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        // window.recaptchaVerifier.render().then(function(widgetId) {
        // grecaptcha.reset(widgetId);
        // })
        alert('Incorrect verification code')
      });
  }

  function handleButtonClick(e){
    if(!verificationCode){
      onSignInSubmit(e);
    }else{
      verificationConfirmation();
    }
  }
  function handleSignupClick(){
    completeSignup();
  }

  return (
      <>
        <AppBar position="sticky" style={{ minWidth: 'fit-content', boxShadow: 'none' }}>
        <Box className={classes.govHeader}>
          <Container className={classes.govHeaderContainer}>
            <Toolbar className={classes.govHeaderToolbar}>
              <Box display="flex" width="100%" justifyContent="space-between">
                <Box display="flex">
                  <Typography className={`${classes.spacingRight} ${classes.hand} ${classes.bold}`}>
                    Comlib
                  </Typography>
                <Box px={2}>
                  <Divider orientation="vertical"/>
                </Box>
              </Box>
              </Box>
            </Toolbar>
          </Container>
        </Box>
        </AppBar>
        <Box className="container">
          <Box className="row" p={4}>
            <Box pl={2}>
              <Typography variant="h4">Login or Register</Typography>
            </Box>
            <Box pt={1} pl={2}>
              <Typography variant="subtitle1">If you don't have an account, you can create one by entering your phone number below. If you do have an account, you can login instead.</Typography>
            </Box>
            <Box id="recaptcha-container"/>
            <Box pt={3} pl={2} className="pb-4 form-group">
              <TextField variant="outlined" onChange={(e) => setLocalPhoneNumber(e.target.value)} style={{width: "50%"}} placeholder="Enter your phone number" type="number" className="form-control" />
            </Box>
            {showVerificationField && (
              <Box pt={3} pl={2} className="pb-4 form-group">
                <TextField onChange={(e) => setVerificationCode(e.target.value)} variant="outlined" style={{width: "50%"}} placeholder="Verification code" type="number" className="form-control"/>
              </Box>
            )}
             {showNameField && (
              <Box pt={3} pl={2} className="pb-4 form-group">
                <TextField onChange={(e) => setName(e.target.value)} variant="outlined" style={{width: "50%"}} placeholder="Name" type="text" className="form-control"/>
              </Box>
            )}
            {!name && (
              <Box pt={3} pl={2}>
                <Button onClick={(e)=>handleButtonClick(e)} color="primary" variant="contained" type="submit" className="btn btn-primary">
                  {showVerificationField?"Let's go!":"Next"}
                </Button>
              </Box>
            )}
            {name &&(
              <Box pt={3} pl={2}>
                <Button onClick={(e)=>handleSignupClick(e)} color="primary" variant="contained" type="submit" className="btn btn-primary">
                  Let's Go!
                </Button>
              </Box>
            )}
          </Box>
        </Box>
    </> 
  );
}

export default Authenticator;
