import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import './Reg.css';

const RegisterPage = () => {
    const [credentials, setCredentials] = useState({ name: '', email: '', password1: '', password2: '' });
    const { handleRegister } = useAuth();

    const handleInputChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setCredentials({ ...credentials, [name]: value });
    };

    return (
        <div className="register-background">
            <div className="register-shape"></div>
            <div className="register-shape"></div>
            <div className="register-form--wrapper">
                <form onSubmit={(e) => handleRegister(e, credentials)} className="register-form">
                    <h3>Create Account</h3>

                    <div className="register-field--wrapper">
                        <label>Name</label>
                        <input 
                            required 
                            type="text" 
                            name="name" 
                            value={credentials.name} 
                            placeholder="Enter your name..." 
                            onChange={handleInputChange} 
                        />
                    </div>

                    <div className="register-field--wrapper">
                        <label>Email</label>
                        <input 
                            required 
                            type="email" 
                            name="email" 
                            value={credentials.email} 
                            placeholder="Enter your email..." 
                            onChange={handleInputChange} 
                        />
                    </div>

                    <div className="register-field--wrapper">
                        <label>Password</label>
                        <input 
                            required 
                            type="password" 
                            name="password1" 
                            value={credentials.password1} 
                            placeholder="Enter a password..." 
                            onChange={handleInputChange} 
                        />
                    </div>

                    <div className="register-field--wrapper">
                        <label>Confirm Password</label>
                        <input 
                            required 
                            type="password" 
                            name="password2" 
                            value={credentials.password2} 
                            placeholder="Confirm your password..." 
                            onChange={handleInputChange} 
                        />
                    </div>

                    <div className="register-field--wrapper">
                        <button 
                            className="register-btn--lg register-btn--main enabled" 
                            type="submit"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
            <div className="register-shape"></div>
        </div>
    );
};

export default RegisterPage;
