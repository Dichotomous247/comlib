import React, {useState,useEffect} from 'react';
import firebase from './firebase';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import { Box } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  }
});

function MyBooks(props) {
  const [myBooks, setMyBooks] = useState([])
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [showAlert,setShowAlert] = useState(true);
  const classes = useStyles()
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (
    event
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const getBooksForLoggedInUser = async () => {
      // fetch books for this user
      const database = firebase.database()
      await database.ref(`users/${props.phoneNumber}/books`).on('value', (snapshot) => {
        const bookList = []
        const currReading=[]
        for (const property in snapshot.val()) {
          bookList.push(snapshot.val()[property])

          if(snapshot.val()[property].isCurrentlyReading) {
            currReading.push(snapshot.val()[property]);
          }
        }

        setCurrentlyReadingBooks([...currReading])
        setMyBooks([...bookList])
      })
    }

    getBooksForLoggedInUser()
  }, []);

    return (
      <>
        {props.bookAdded && showAlert && (
          <Alert severity="success" onClose={() => setShowAlert(false)}>Successfully added book!</Alert>
        )}
        <Box p={3}>
            <Box pb={3}>
                <Typography variant="h5">Currently Reading</Typography>
                <ul>
                {currentlyReadingBooks.map((book) => (
                    <li>{book.title} by {book.author}</li>
                ))}
                </ul>
            </Box>

            <div>
                <Typography variant="h5">My Books</Typography>
                <br/>
                <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell>Genre</TableCell>
                        <TableCell>Read</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {myBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                        <TableRow key={row.title + Math.random()}>
                        <TableCell component="th" scope="row">
                            {row.title}
                        </TableCell>
                        <TableCell>{row.author}</TableCell>
                        <TableCell>{row.genre}</TableCell>
                        <TableCell>{(row.isRead && 'Yes') || 'No'}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
                <TablePagination
                rowsPerPageOptions={[5, 10, 15, 20]}
                component="div"
                count={myBooks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        </Box>
      </>
    );
}

export default MyBooks;