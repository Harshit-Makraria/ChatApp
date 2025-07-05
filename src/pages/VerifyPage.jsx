import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Account } from 'appwrite';
import client from '../appwriteConfig';
import "./Spinner.css"
const account = new Account(client);

const VerifyPage = () => {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    const userId = urlParams.get('userId');

    useEffect(() => {
        const verifyUser = async () => {
            if (!secret || !userId) {
                alert("Invalid verification request.");
                return;
            }

            try {
                await account.createSession(userId, secret);
                alert("Email verified successfully!");
                navigate("/login"); // Redirect to login or another page
            } catch (error) {
                console.error("Verification failed:", error.message);
                alert("Verification failed. Please try again.");
            }
        };

        verifyUser();
    }, [navigate]);

    return (
        <div>
            <div className="centered-spinner">
        <div className="spinner"></div>
        </div>
        </div>
    );
};

export default VerifyPage;
