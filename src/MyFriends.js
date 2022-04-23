import React, {useState,useEffect} from 'react';
import firebase from './firebase';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import { Box, Card, CardActions, CardContent, Chip} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  }
});

function MyFriends(props) {
  const [searchPhoneNumber,setSearchPhoneNumber] = useState("");
  const [showAlert,setShowAlert] = useState(true);
  const [isError, setIsError] = useState("");
  const [searchedUser,setSearchedUser] = useState("");
  const [cardPhoneNumber, setCardPhoneNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [myFriends,setMyFriends] = useState([]);
  const [refetchFriends, setRefetchFriends] = useState(false);

  const classes = useStyles()

  const database = firebase.database()

  const chipColorMappings = {
    "Pending":"#9e9e9e",
    "Requested":"#ff9800",
    "Friend": "#4caf50",
    "Rejected":"#f44336"
  }

  useEffect(() => {
    const getFriendsForLoggedInUser = async () => {
      // fetch friends for this user
      await database.ref(`users/${props.phoneNumber}/friends`).on('value', (snapshot) => {
        let friends = [...myFriends]
        if(snapshot.val()){
          for (const [key, value] of Object.entries(snapshot.val())) {
            if(value.type==="requested"){
              friends.push({
                phoneNumber: key, 
                name: value.name,
                status: "Requested"
              })
            }else if(value.type==="pending"){
              friends.push({
                phoneNumber: key, 
                name: value.name,
                status: "Pending"
              })
            }else if(value.type==="friend"){
              friends.push({
                phoneNumber: key, 
                name: value.name,
                status: "Friend"
              })
            }else{
              friends.push({
                phoneNumber: key, 
                name: value.name,
                status: "Rejected"
              })
            }
          }
          friends = friends.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.phoneNumber === value.phoneNumber && t.name === value.name && t.status === value.status
            ))
          )
          setMyFriends(friends)
        }
      })
    }

    getFriendsForLoggedInUser()
  }, [refetchFriends]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (
    event
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function handleAcceptRequest({ phoneNumber: friendPhoneNumber, name: friendName }) {
    await database.ref(`users/${friendPhoneNumber}/friends`).update({
      [props.phoneNumber]: {
        name: props.myProfile.name,
        type: "friend"
      }
    })

    await database.ref(`users/${props.phoneNumber}/friends`).update({
      [friendPhoneNumber]: {
        name: friendName,
        type: "friend"
      }
    })

    const updatedMyFriends = myFriends.filter(object => {
      return object.phoneNumber !== friendPhoneNumber;
    });
    setMyFriends(updatedMyFriends)

    setRefetchFriends(true);
  }

  async function handleDeclineRequest({ phoneNumber: friendPhoneNumber, name: friendName }){
    await database.ref(`users/${friendPhoneNumber}/friends`).update({
      [props.phoneNumber]: {
        name: props.myProfile.name,
        type: "rejected"
      }
    })

    await database.ref(`users/${props.phoneNumber}/friends`).update({
      [friendPhoneNumber]: {
        name: friendName,
        type: "rejected"
      }
    })

    const updatedMyFriends = myFriends.filter(object => {
      return object.phoneNumber !== friendPhoneNumber;
    });
    setMyFriends(updatedMyFriends)
    setRefetchFriends(true);
  }

  async function handleSearch(e){
    let resultExists; 
    await database.ref(`users/+${searchPhoneNumber}`).once('value', (snapshot) => {
      resultExists = snapshot.val()
    })

    if(!resultExists){
      setIsError("This user could not be found");
      setCardPhoneNumber("");
      setShowAlert(true);
      setSearchedUser("");
    }else{
      setIsError("");
      setShowAlert(false);
      setSearchedUser(resultExists.profile.name);
      setCardName(resultExists.profile.name)
      setCardPhoneNumber(searchPhoneNumber);
    }
  }

  async function handleAddFriend(){
    const cardPhoneNumberKey = `+${cardPhoneNumber}`
    await database.ref(`users/${props.phoneNumber}/friends`).update({
      [cardPhoneNumberKey]: {
        name: cardName,
        type: "requested"
      }
    })

    await database.ref(`users/+${searchPhoneNumber}/friends`).update({
      [props.phoneNumber]: {
        name: props.myProfile.name,
        type: "pending"
      }
    })

    setSearchedUser("")
    setRefetchFriends(true);
  }

  const card = (
    <>
      <CardContent>
        <Typography variant="h5" component="div">
          {cardName}
        </Typography>
        <Typography variant="body2">
          {cardPhoneNumber}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" variant="outlined" onClick={()=>handleAddFriend()}>Add Friend</Button>
      </CardActions>
    </>
  );

    return (
      <>
        {isError && showAlert && (
          <Alert severity="error" onClose={() => setShowAlert(false)}>{isError}</Alert>
        )}
        <Box p={3}>
            <Box pt={1}>
              <Typography variant="h5">Search for Friends by Phone Number</Typography>
            </Box>
            <Box id="recaptcha-container"/>
            <Box display="flex" justifyContent="space-between" pt={3} className="pb-4 form-group" >
              <Box style={{width: "50%", display: "inline-grid"}}>
                <TextField variant="outlined" onChange={(e) => setSearchPhoneNumber(e.target.value)} placeholder="Enter a phone number" type="number" className="form-control" style={{paddingBottom: !searchedUser&&"10px"}}/>
                <Button onClick={(e)=>handleSearch(e)} color="primary" variant="contained" type="submit" className="btn btn-primary" style={{height: "56px"}}>
                  Search
                </Button>
              </Box>
              {searchedUser &&(
                <Box style={{width: "25%"}}>
                  <Card variant="outlined">{card}</Card>
                </Box>
              )}
            </Box>
            {!!myFriends.length && (
              <Box pt={2}>
                <Typography variant="h5">My Friends</Typography>
                <br/>
                <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {myFriends.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={row.title + Math.random()}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell>{row.phoneNumber}</TableCell>
                        <TableCell><Chip label={row.status} style={{backgroundColor: chipColorMappings[row.status]}} /></TableCell>
                        {row.status==="Pending"?(
                          <TableCell>
                            <Box display="flex" justifyContent="space-evenly">
                              <Button onClick={()=>handleAcceptRequest(row)} variant="contained" type="submit" className="btn" style={{backgroundColor:"#4caf50"}}>
                                Accept
                              </Button>
                              <Button onClick={()=>handleDeclineRequest(row)} variant="contained" type="submit" className="btn" style={{backgroundColor:"#f44336"}}>
                                Decline
                              </Button>
                            </Box>
                          </TableCell>
                        ):(
                          <TableCell></TableCell>
                        )}
                      </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
                <TablePagination
                rowsPerPageOptions={[5, 10, 15, 20]}
                component="div"
                count={myFriends.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            )} 
          </Box>
      </>
    );
}

export default MyFriends;