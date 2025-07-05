import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Room from './pages/Room'
import PrivateRoutes from './utils/PrivateRoutes'
import { AuthProvider } from './utils/AuthContext'
import RegisterPage from './pages/RegisterPage'
import VerifyPage from './pages/VerifyPage'
import EnvDebug from './components/EnvDebug'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

const App = () => {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path='/login' element={<LoginPage/>}/>
              <Route path='/verify' element={<VerifyPage/>}/>
              <Route path='/register' element={<RegisterPage/>}/>
              
              <Route element={<PrivateRoutes/>}>  
                <Route path='/' element={<Room/>}/>
                <Route path='/chat/:chatId' element={<Room/>}/>
                <Route path='/group/:groupId' element={<Room/>}/>
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
        <EnvDebug />
      </div>
    </ErrorBoundary>
  )
}

export default App

