import axios from "axios";
import UserProfile from "./UserProfile";
import toast from "react-hot-toast";

export const BaseURL = "http://localhost:8000";
const BaseURLAPI = BaseURL + "/api";

const Request = axios.create({
  baseURL: BaseURLAPI,
});

let toastShown = false; // Add a flag to track if toast has been shown

Request.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    // Ensure toast only shows once
    if (
      error.response &&
      error.response.status == 401 &&
      error.response?.data?.detail == "Not Authenticated" &&
      !toastShown
    ) {
      toastShown = true;  // Set the flag to prevent multiple toasts
      toast.error("User Session is Expired.redirecting to Login...");
      
     
      setTimeout(() => {
        UserProfile.DeleteUser(); // Delete the user profile data
        window.location.href = '/login'; // Redirect to the login page
      }, 1200); // Add a delay to give the user time to see the toast

    }

    // Pass the error to the next handler
    return Promise.reject(error);
  }
);

export default Request;
