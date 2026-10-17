import {
    Navigate,
    Outlet
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


export default function ProtectedRoute() {

    const {
        isAuthenticated
    } = useAuth();


    /*
     * If JWT doesn't exist,
     * user cannot access dashboard.
     */
    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /*
     * User is authenticated.
     */
    return <Outlet />;
}