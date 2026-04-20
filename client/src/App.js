import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { authRoutes, userRoutes } from './Routes/AllRoutes';
import NonAuthLayout from './Routes/middleware/NonAuthLayout';
import AuthLayout from './Routes/middleware/AuthLayout';
import Layout from './Screens/Layout/Layout';

const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          {authRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={<NonAuthLayout>{route.component}</NonAuthLayout>}
              key={idx}
            />
          ))}

          {userRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <AuthLayout>
                  <Layout>
                    {route.component}
                  </Layout>
                </AuthLayout>
              }
              key={idx}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  )
}

export default App
