import React, {useState} from 'react';
import Authenticator from './Authenticator';
import Homepage from './Homepage';

const jwt = require('jsonwebtoken');

function App() {
  let authStatus = false;
  let decodedPhoneNumber = "";

  try {
    const decoded = jwt.verify(window.sessionStorage.getItem('jwt'), 'secret');
    if (decoded.phoneNumber) {
      authStatus = true;
      decodedPhoneNumber = decoded.phoneNumber;
    } else {
      authStatus = false;
    }
  } catch(err) {
    authStatus = false;
  }

  const [isAuthed, setIsAuthed] = useState(authStatus);
  const [phoneNumber, setPhoneNumber] = useState(decodedPhoneNumber);

  return (
    <>
      {!isAuthed && (
        <Authenticator setIsAuthed={setIsAuthed} setPhoneNumber={setPhoneNumber} />
      )}
      {isAuthed && (
        <Homepage setIsAuthed={setIsAuthed} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} />
      )}
    </>
  );
}

export default App;
