import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Room from './pages/Room'
import PrivateRoutes from './utils/PrivateRoutes'
import { AuthProvider } from './utils/AuthContext'
// import Header from './components/Header'
import RegisterPage from './pages/RegisterPage'
import VerifyPage from './pages/VerifyPage'

const App = () => {
  return (
    <div>

      <Router>
        <AuthProvider>
        <Routes>
          
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/verify' element={<VerifyPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          
        <Route element={<PrivateRoutes/>}>  
          <Route path='/' element={<Room/>}/>
        </Route>
        </Routes>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App
