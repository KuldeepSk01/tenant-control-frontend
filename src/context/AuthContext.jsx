import {
    createContext,
    useContext,
    useState
} from "react";

import {
    getToken,
    getUser,
    getUserProfile,
    logout as removeAuth
} from "../utils/auth";


const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [token, setToken] =
        useState(getToken());

    const [user, setUser] =
        useState(getUser());

 const [userProfile, setUserProfile] =
        useState(getUserProfile());

    /*
     * Called after successful login.
     */
    function loginUser(
        accessToken,
        userData
    ) {

        localStorage.setItem(
            "accessToken",
            accessToken
        );

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setToken(accessToken);
        setUser(userData);
    }



    /*
     * Logout user.
     */
    function logoutUser() {

        removeAuth();

        setToken(null);

        setUser(null);

        setUserProfile(null);
    }


    function updateUser(userData) {

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    }

    function updateUserProfile(userProfileData) {

        localStorage.setItem(
            "user_profile",
            JSON.stringify(userProfileData)
        );

        setUserProfile(userProfileData);
    }


    const value = {

        token,

        user,

        userProfile,

        isAuthenticated: !!token,

        loginUser,

        updateUser,

        updateUserProfile,

        logoutUser

    };


    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}