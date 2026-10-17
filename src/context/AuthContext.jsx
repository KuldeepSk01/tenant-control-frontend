import {
    createContext,
    useContext,
    useState
} from "react";

import {
    getToken,
    getUser,
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
    }


    function updateUser(userData) {

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    }


    const value = {

        token,

        user,

        isAuthenticated: !!token,

        loginUser,

        updateUser,

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