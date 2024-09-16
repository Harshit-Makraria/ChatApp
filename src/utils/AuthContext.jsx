    import { createContext, useState, useEffect, useContext } from "react";
    import { account } from "../appwriteConfig";
    import { useNavigate } from "react-router-dom";
    import { ID } from "appwrite";
    const AuthContext = createContext()


    export const AuthProvider = ({children}) =>{
        const [authToken, setAuthToken] = useState(null);
        const navigate = useNavigate()
        const [user, setUser] = useState(null)
        const [loading, setLoading] = useState(true)


        useEffect(() => {
            
            getUserOnLoad();
        },[])
        
        const getUserOnLoad = async () => {
            try {
                let accountDetails = await account.get();
                setUser(accountDetails);
            } catch (error) {}
            setLoading(false);
        };

        const handleUserLogin = async (e, credentials) => {
            e.preventDefault();
            // console.log("CREDS:", credentials);

            try {
            let response = await account.createEmailPasswordSession(
                    credentials.email,
                    credentials.password,
                );
                console.log("logged in",response)
                const accountDetails = await account.get();
                setUser(accountDetails);
                navigate("/");
            } catch (error) {
                console.error(error);
            }
        };
        const handleLogout = async () => {
            const response = await account.deleteSession("current");
            setUser(null);
        };

        const handleRegister = async (e, credentials) => {
            e.preventDefault();
            if (credentials.password1 !== credentials.password2) {
                alert("Passwords did not match!");
                return;
            }
        
            try {
                const userId = ID.unique(); // Unique ID for the user
                const response = await account.create(
                    userId,
                    credentials.email,
                    credentials.password1,
                    credentials.name
                );
                console.log("User registered!", response);
        
                const redirectUrl = "http://localhost:5173/verify"; // Redirect URL for the verification page
                const token = await account.createMagicURLToken(userId, credentials.email, redirectUrl);
                console.log("Magic URL Token created!", token);
                alert("Check email for verification.");
            } catch (error) {
                console.error(error);
            }
        };

        const contextData = {
            user,
            handleUserLogin,
            handleLogout,
            handleRegister,
        }
        
        return<AuthContext.Provider value={contextData}>
            {loading?  <div className="centered-spinner">
        <div className="spinner"></div>
        </div> : children}
        </AuthContext.Provider>

    }


    
    export const useAuth = () =>{ return useContext(AuthContext)}



    export default AuthContext