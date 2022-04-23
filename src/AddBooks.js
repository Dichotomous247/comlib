import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { Box } from '@material-ui/core';
import firebase from './firebase';
import MyBooks from './MyBooks';

function AddBooks(props) {
    const addBook=async()=>{
        try{
          const database = firebase.database()
          await database.ref(`users/${props.phoneNumber}/books`).push({
            title: bookTitle,
            author: bookAuthor,
            genre: bookGenre,
            isRead: hasAlreadyRead === "true" ? true : false,
            isCurrentlyReading: isCurrentlyReading === "true" ? true : false
          })
          setGoToMyBooks(true);  
        }
        catch(e){
          console.log(e)
        }
      };

    const [bookTitle,setBookTitle] = useState("")
    const [bookAuthor,setBookAuthor] = useState("")
    const [bookGenre, setBookGenre] = useState("")
    const [isCurrentlyReading, setIsCurrentlyReading] = useState("true")
    const [hasAlreadyRead, setHasAlreadyRead] = useState("true")
    const [goToMyBooks, setGoToMyBooks] = useState(false)

    if(goToMyBooks){
      return (
        <MyBooks phoneNumber={props.phoneNumber} bookAdded={true}/> 
      )
    }

    return (
        <Box p={3}>
        <Box pb={3}>
            <Typography variant="h5">Add Books</Typography>
        </Box>
            <TextField fullWidth label="Title" placeholder="Harry Potter" variant="outlined" onChange={(event)=>setBookTitle(event.target.value)}/>
        
            <Box mt={3}>
            <TextField fullWidth placeholder="J.K Rowling" label="Author" variant="outlined" onChange={(event)=>setBookAuthor(event.target.value)}/>
            </Box>
            <Box mt={3}>
            <TextField  fullWidth placeholder="Magic" label="Genre" variant="outlined" onChange={(event)=>setBookGenre(event.target.value)}/>
            </Box>
            <Box pt={3}>
            <Typography variant="subtitle1">Are you currently reading this book?</Typography>
            <FormControl component="fieldset">
                <RadioGroup aria-label="currently-reading" name="currently-reading" value={isCurrentlyReading} onChange={(event) =>setIsCurrentlyReading(event.target.value)}>
                <FormControlLabel value="true" control={<Radio color="primary" />} label="Yes" />
                <FormControlLabel value="false" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
            </FormControl>
            </Box>
            <Box pt={3}>
            <Typography variant="subtitle1">Have you read this book in the past?</Typography>
            <FormControl component="fieldset">
                <RadioGroup aria-label="has-already-read" name="has-already-read" value={hasAlreadyRead} onChange={(event) =>setHasAlreadyRead(event.target.value)}>
                <FormControlLabel value="true" control={<Radio color="primary" />} label="Yes" />
                <FormControlLabel value="false" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
            </FormControl>
            </Box>
            <Box pt={5}>
            <Button color="primary" variant="contained" onClick={()=>addBook()}>Add</Button>
            </Box>
        </Box>
    );
}

export default AddBooks