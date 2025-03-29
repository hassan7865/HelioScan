import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/SignUp/SignUp";
import UploadScan from "./Pages/UploadResult/UploadResult";
import Dashboard from "./Pages/Dashboard/Dashboard";
import PrivateRoute from "./Components/PrivateRoutes";
import Enable2FA from "./Pages/Enable2Fa/Enable2Fa";
import ViewResult from "./Pages/ViewResults/ViewResult";
import { Toaster } from "react-hot-toast";
import FeedbackForm from "./Pages/Feedback/Feedback";
import LandingPage from "./Pages/Landing/Landing";
import ContactUs from "./Pages/Contactus/Contactus";
import "./App.css";
import AdminDashboard from "./Pages/Admin/Dashboard/Dashboard";
import AdminFeedback from "./Pages/Admin/Feedback/Feedback";
import ForgotPassword from "./Pages/ForgetPassword/ForgetPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import LoadingPage from "./Components/LoadingVideo/LoadingVideo";
import PublicRoute from "./Components/PublicRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account-validate" element={<ForgotPassword />} />
            <Route path="/reset-password/:guid" element={<ResetPassword />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/contactus" element={<ContactUs />} />
          </Route>

          {/* 2FA Route - Separate to ensure users are properly redirected */}
          <Route path="/enable2fa" element={<Enable2FA />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/uploadScan" element={<UploadScan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viewResults" element={<ViewResult />} />
            <Route path="/feedback" element={<FeedbackForm />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Route>

          
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
