    import { createContext, useState, useEffect, useContext } from "react";
    import { account, createUserProfile, getUserProfile, updateUserOnlineStatus } from "../appwriteConfig";
    import { useNavigate } from "react-router-dom";
    import { ID } from "appwrite";
    
    const AuthContext = createContext();

    export const AuthProvider = ({children}) => {
        const [authToken, setAuthToken] = useState(null);
        const navigate = useNavigate();
        const [user, setUser] = useState(null);
        const [userProfile, setUserProfile] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            getUserOnLoad();
            
            // Handle page unload to set user offline
            const handleBeforeUnload = () => {
                if (user) {
                    updateUserOnlineStatus(user.$id, false);
                }
            };
            
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }, []);

        useEffect(() => {
            if (user) {
                loadUserProfile();
                updateUserOnlineStatus(user.$id, true);
            }
        }, [user]);

        const getUserOnLoad = async () => {
            try {
                console.log('Attempting to get user session...');
                let accountDetails = await account.get();
                console.log('User session found:', accountDetails);
                setUser(accountDetails);
            } catch (error) {
                console.log("No active session:", error.message);
                setUser(null);
            }
            setLoading(false);
        };

        const loadUserProfile = async () => {
            if (!user || !user.$id) {
                console.error('No user ID available for profile loading');
                return;
            }

            try {
                console.log('Loading user profile for:', user.$id);
                const profile = await getUserProfile(user.$id);
                console.log('User profile loaded:', profile);
                setUserProfile(profile);
            } catch (error) {
                console.log('Profile not found, creating new one:', error.message);
                // Profile doesn't exist, create one
                try {
                    const profileData = {
                        name: user.name || 'Unknown User',
                        email: user.email || '',
                        is_online: true,
                        last_seen: new Date().toISOString(),
                        avatar_url: null,
                        bio: ''
                    };
                    console.log('Creating user profile with data:', profileData);
                    const newProfile = await createUserProfile(user.$id, profileData);
                    console.log('User profile created:', newProfile);
                    setUserProfile(newProfile);
                } catch (createError) {
                    console.error("Error creating user profile:", createError);
                    // Set a fallback profile to prevent app from breaking
                    setUserProfile({
                        $id: user.$id,
                        name: user.name || 'Unknown User',
                        email: user.email || '',
                        is_online: true,
                        last_seen: new Date().toISOString()
                    });
                }
            }
        };

        const handleUserLogin = async (e, credentials) => {
            e.preventDefault();

            try {
                let response = await account.createEmailPasswordSession(
                    credentials.email,
                    credentials.password,
                );
                console.log("logged in", response);
                const accountDetails = await account.get();
                setUser(accountDetails);
                navigate("/");
            } catch (error) {
                console.error(error);
            }
        };
        
        const handleLogout = async () => {
            if (user) {
                await updateUserOnlineStatus(user.$id, false);
            }
            const response = await account.deleteSession("current");
            setUser(null);
            setUserProfile(null);
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
            userProfile,
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