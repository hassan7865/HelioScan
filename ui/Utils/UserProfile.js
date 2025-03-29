const SetUserData = (userData) => {
    localStorage.setItem("helioscan_user_data", JSON.stringify(userData));
};

const GetUserData = () => {
    const user = localStorage.getItem("helioscan_user_data");
    return user ? JSON.parse(user) : null; 
};

const DeleteUser=()=>{
    localStorage.removeItem("helioscan_user_data")
}
const UpdateUserData=(userData)=>{
   
    const user = GetUserData()
    user.is_2fa_enabled = userData.is_2fa_enabled
   


  
    SetUserData(user)
}

export default { SetUserData, GetUserData,DeleteUser,UpdateUserData };