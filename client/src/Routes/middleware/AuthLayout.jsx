import React from 'react'
import { Navigate } from 'react-router-dom';

const AuthLayout = (props) => {
  // if (!localStorage.getItem("encryptedData")) {
  //   return (
  //     <Navigate to={{ pathname: "/login" }} />
  //   );
  // }
  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  )
}

export default AuthLayout

