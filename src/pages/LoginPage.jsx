import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import './LogReg.css';

const LoginPage = () => {
  const { user, handleUserLogin } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  useEffect(() => {
    const { email, password } = credentials;
    const isValid = email && password.length >= 8;
    setIsButtonEnabled(isValid);
  }, [credentials]);

  return (
    <div className="login-background">
      <div className="login-shape"></div>
      <div className="login-form--wrapper">
        <form onSubmit={(e) => handleUserLogin(e, credentials)} className="login-form">
          <h3>Welcome Back</h3>

          <div className="field--wrapper">
            <label htmlFor="email">Email</label>
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email..."
              value={credentials.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="field--wrapper">
            <label htmlFor="password">Password</label>
            <input
              required
              type="password"
              name="password"
              id="password"
              placeholder="Enter password..."
              value={credentials.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="field--wrapper">
            <button
              type="submit"
              disabled={!isButtonEnabled}
              className={`btn btn--lg btn--main ${isButtonEnabled ? 'enabled' : 'disabled'}`}
            >
              Login
            </button>
          </div>
           
        </form>

        <p>Don't have an account? <Link to="/register">Register here</Link></p>
        
      </div>
      <div className="login-shape"></div>
      
    </div>
  );
};

export default LoginPage;
