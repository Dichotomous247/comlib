import React, {useState,useEffect} from 'react';
import { Box } from '@material-ui/core'; 
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'; 
import Avatar  from '@material-ui/core/Avatar';
import firebase from './firebase';
import Alert from '@material-ui/lab/Alert';


function Profile(props) {
    const database = firebase.database()
    const [name,setName] = useState(props.myProfile?.name || "")
    const [phoneNumber, setPhoneNumber] = useState(props.phoneNumber || "")
    const [email, setEmail] = useState(props.myProfile?.email || "")
    const [bio, setBio] = useState(props.myProfile?.bio || "")
    const [myBooks, setMyBooks] = useState([])
    const [isUpdated, setIsUpdated] = useState(false)
    const [showAlert,setShowAlert] = useState(true);
    const [isError, setIsError] = useState("");

    const getBooksForLoggedInUser = async (database) => {
        // fetch books for this user
        await database.ref(`users/${props.phoneNumber}/books`).on('value', (snapshot) => {
          const bookList = []
          for (const property in snapshot.val()) {
            bookList.push(snapshot.val()[property])
          }
          console.log(bookList)
          setMyBooks([...bookList])
        })
      }

      useEffect(()=>{
        getBooksForLoggedInUser(database);
      },[])

   async function saveProfileData() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ((!email||re.test(email)) && isValidPhonenumber()) {
            try{

                let resultExists; 
                console.log(phoneNumber, props.phoneNumber)
                await database.ref(`users/${phoneNumber}`).once('value', (snapshot) => {
                    resultExists = snapshot.val()
                })
                console.log(resultExists)
                if(!resultExists){
                    await database.ref(`users/${props.phoneNumber}`).remove()
                    await database.ref(`users/${phoneNumber}/profile`).update({
                        name,
                        email,
                        bio
                    })
    
                    for (const book of myBooks) {
                        console.log(book)
                        await database.ref(`users/${phoneNumber}/books`).push({
                            title: book.title,
                            author: book.author,
                            genre: book.genre,
                            isRead: book.isRead,
                            isCurrentlyReading: book.isCurrentlyReading
                        })
                        }
    
                        props.setPhoneNumber(phoneNumber);
                        setIsError("");
                        setIsUpdated(true);
                        setShowAlert(true);
                }else if(phoneNumber===props.phoneNumber){
                    console.log("hey")
                    await database.ref(`users/${phoneNumber}/profile`).update({
                        name,
                        email,
                        bio
                    })
                    setIsError("");
                    setIsUpdated(true);
                    setShowAlert(true);
                }else{
                    setIsError("An account already exists with this phone number.");
                    setIsUpdated(false);
                    setShowAlert(true);
                }
            }
            catch(e){
                console.log(e)
                setIsError("An error occurred while trying to update your profile.");
                setIsUpdated(false);
                setShowAlert(true);
            }
        }else{
            setIsError("Mandatory form fields are missing or invalid.");
            setIsUpdated(false);
            setShowAlert(true);
        }
    }

    function isValidPhonenumber(){
        if(phoneNumber[0]!== "+"){
            return false;
        }else if(phoneNumber[1]!== "1"){
            return false;
        }else if(phoneNumber.length!==12){
            return false;
        }else{
            return true;
        }

    }

    function getInitialsFromName(name) {
        let result = name[0];

        for(let i = 1; i<name.length; i++){
            if(name[i-1]===" "){
                result = result+name[i];
            }
        }

        return result;
    }

    return (
      <>

        {isUpdated && showAlert && (
          <Alert severity="success" onClose={() => setShowAlert(false)}>Successfully updated profile</Alert>
        )}

        {isError && showAlert && (
          <Alert severity="error" onClose={() => setShowAlert(false)}>{isError}</Alert>
        )}

        <Box p={3}>
            {/* <Typography variant="h5">Profile</Typography> */}
            <Avatar style={{width: 100, height:100}}>{getInitialsFromName(name)}</Avatar>
            <Box mt={3}>
                <TextField style={{width: "50%"}} placeholder="Peter" label="Name" variant="outlined" value={name} onChange={(e)=>{
                    setName(e.target.value)
                }}/>
            </Box>
            <Box mt={3}>
                <TextField style={{width: "50%"}} placeholder="+12222222222" label="Phone number" variant="outlined" value={phoneNumber} onChange={(e)=>{
                    setPhoneNumber(e.target.value)
                }}/>
            </Box>
            <Box mt={3}>
                <TextField style={{width: "50%"}} placeholder="example@gmail.com" label="Email" variant="outlined" type="email" value={email} onChange={(e)=>{
                    setEmail(e.target.value)
                }}/>
            </Box>
            <Box mt={3}>
                <TextField style={{width: "50%"}} placeholder="I am an avid reader" label="Bio" variant="outlined" multiline rows={7} value={bio} onChange={(e)=>{
                    setBio(e.target.value)
                }}/>
            </Box>
            <Box mt={2}>
                <Button color="primary" variant="contained" onClick={()=>saveProfileData()}>Save</Button>
            </Box>
        </Box>
      </>
    );
}

export default Profile;