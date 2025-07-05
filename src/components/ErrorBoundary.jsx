import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Settings } from 'react-feather';
import './ErrorBoundary.css';

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);
    const [errorInfo, setErrorInfo] = useState(null);

    useEffect(() => {
        const handleError = (event) => {
            console.error('Global error caught:', event.error);
            if (event.error.message?.includes('fetch user') || 
                event.error.message?.includes('user profile') ||
                event.error.message?.includes('database') ||
                event.error.message?.includes('collection')) {
                setHasError(true);
                setError(event.error);
                setErrorInfo(event.error.stack);
            }
        };

        const handlePromiseRejection = (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (event.reason?.message?.includes('fetch user') || 
                event.reason?.message?.includes('user profile') ||
                event.reason?.message?.includes('database') ||
                event.reason?.message?.includes('collection')) {
                setHasError(true);
                setError(event.reason);
                setErrorInfo(event.reason.stack);
            }
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handlePromiseRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handlePromiseRejection);
        };
    }, []);

    const retry = () => {
        setHasError(false);
        setError(null);
        setErrorInfo(null);
        window.location.reload();
    };

    if (hasError) {
        return (
            <div className="error-boundary">
                <div className="error-container">
                    <div className="error-icon">
                        <AlertCircle size={48} />
                    </div>
                    <h1>Oops! Something went wrong</h1>
                    <p className="error-message">
                        {error?.message?.includes('fetch user') || error?.message?.includes('user profile') 
                            ? "Failed to load user data. This might be due to missing configuration or database issues."
                            : error?.message || "An unexpected error occurred."
                        }
                    </p>
                    
                    <div className="error-details">
                        <h3>Possible solutions:</h3>
                        <ul>
                            <li>Check if your .env file is properly configured</li>
                            <li>Verify your Appwrite database and collections are set up</li>
                            <li>Make sure you're logged in to your account</li>
                            <li>Try refreshing the page</li>
                        </ul>
                    </div>

                    <div className="error-actions">
                        <button onClick={retry} className="retry-button">
                            <RefreshCw size={16} />
                            Retry
                        </button>
                        <button 
                            onClick={() => window.location.href = '/login'} 
                            className="login-button"
                        >
                            Go to Login
                        </button>
                    </div>

                    {import.meta.env.MODE === 'development' && (
                        <details className="error-technical">
                            <summary>Technical Details (Development Only)</summary>
                            <pre>{error?.stack || errorInfo}</pre>
                        </details>
                    )}
                </div>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;
