import React from 'react'
import { useAuth } from '../utils/AuthContext'
import { Link } from 'react-router-dom'
import { LogOut, LogIn } from 'react-feather'

const Header = () => {
    const {user, handleLogout} = useAuth()
  return (
    <div id="header--wrapper">
        {user ? (
            <>
                <span className="header-welcome">Welcome, <strong>{user.name}</strong></span>
                <LogOut className="header--link" onClick={handleLogout}/>
            </>
        ): (
            <>
                <Link to="/">
                    <LogIn className="header--link"/>
                </Link>
            </>
        )}
    </div>
  )
}

export default Header