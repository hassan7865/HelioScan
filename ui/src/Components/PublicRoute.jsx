import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserProfile from "../../Utils/UserProfile";

const PublicRoute = () => {
    const user = UserProfile.GetUserData();

    if (user) {
        if (!user.is_2fa_enabled) {
            return <Navigate to="/enable2fa" />;
        }
        return user.is_admin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />;
    }

    return <Outlet />;
};

export default PublicRoute;
