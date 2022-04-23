import React, {useState,useEffect} from 'react';
import Container from 'react-bootstrap/Container'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { Box, Divider, Button } from '@material-ui/core';
import AddBooks from './AddBooks';
import Profile from './Profile';
import MyBooks from './MyBooks'; 
import Icon from '@mdi/react';
import { mdiAccountCircle, mdiLogoutVariant} from '@mdi/js';
import firebase from './firebase'
import MyFriends from './MyFriends';

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
  userProfile: {
    color: theme.palette.primary.contrastText,
    fontSize: '0.9375rem',
    '& hr': {
      backgroundColor: '#4b5e7e',
      height: '1rem'
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    }
  },
  bold:{
    fontWeight: 'bold'
  }
}));

function Homepage(props) {
  const [showProfile, setShowProfile] = useState(false)
  const [isMyBooks, setIsMyBooks] = useState(true)
  const classes = useStyles()
  const [isFriends, setIsFriends] = useState(false)
  const [myProfile,setMyProfile] = useState(null)

  useEffect(() => {
    const getLoggedInUserProfile = async () => {
      // get the profile of the logged in user
      const database = firebase.database()
      await database.ref(`users/${props.phoneNumber}/profile`).on('value', (snapshot) => {
        console.log(snapshot.val())
        if(snapshot.val()){
          setMyProfile({...snapshot.val()})
        }
      })
    }

    getLoggedInUserProfile()
  }, [props.phoneNumber]);

  return (
    <>
    <AppBar position="sticky" style={{ minWidth: 'fit-content', boxShadow: 'none' }}>
      <Box className={classes.govHeader}>
        <Container className={classes.govHeaderContainer}>
          <Toolbar className={classes.govHeaderToolbar}>
            <Box display="flex" width="100%" justifyContent="space-between">
              <Box display="flex">
                <Typography className={`${classes.spacingRight} ${classes.hand} ${classes.bold}`} onClick={() => setIsMyBooks(true)} >
                  Comlib
                </Typography>
                <Typography className={`${classes.spacingRightSmall} ${classes.hand}`} onClick={() => {
                  setIsMyBooks(true)
                  setShowProfile(false)
                  setIsFriends(false)
                }}>
                  My Books
                </Typography>
                <Typography className={`${classes.spacingRightSmall} ${classes.hand}`} onClick={() => {
                  setIsMyBooks(false)
                  setShowProfile(false)
                  setIsFriends(false)
                }}>
                  Add Books
                </Typography>
                <Typography className={classes.hand} onClick={() => {
                  setIsMyBooks(false)
                  setShowProfile(false)
                  setIsFriends(true)
                }}>
                  Friends
                </Typography>
              </Box>
            </Box>
            <Box display="flex" my="auto" alignItems="center" className={classes.userProfile}>
              <Box className={classes.hand} display="flex" my="auto" alignItems="center" onClick={()=>{setShowProfile(true)}}>
                <Icon path={mdiAccountCircle} size={1.25}/>
                {myProfile && myProfile.name && (
                  <Box ml={1}>
                    {myProfile.name}
                  </Box>
                )}
              </Box>
              <Box px={2}>
                <Divider orientation="vertical"/>
              </Box>
              <Box display="flex" my="auto" alignItems="center">
                <Button variant="contained" component="label" size="medium" color="primary" disableElevation startIcon={<Icon path={mdiLogoutVariant} size={1}/>} onClick={()=>{
                  props.setIsAuthed(false)
                  window.sessionStorage.removeItem('jwt')
                  }}>Logout</Button>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </Box>
      </AppBar>

      {showProfile && (
        <Profile phoneNumber={props.phoneNumber} myProfile={myProfile} setPhoneNumber={props.setPhoneNumber} />
      )}

      {!isMyBooks && !showProfile && !isFriends && (
        <AddBooks phoneNumber={props.phoneNumber}/>
      )}

      {isMyBooks && !showProfile &&(
        <MyBooks phoneNumber={props.phoneNumber}/>
      )}
      
      {isFriends && !showProfile &&(
        <MyFriends phoneNumber={props.phoneNumber} myProfile={myProfile}/>
      )}
    </>
  );
}

export default Homepage;
