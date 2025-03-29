import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserProfile from "../../Utils/UserProfile";

const PrivateRoute = () => {
    const user = UserProfile.GetUserData();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!user.is_2fa_enabled) {
        return <Navigate to="/enable2fa" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
