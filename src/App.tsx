import React from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./components/jobseeker/Profile";
import SignUp from "./components/jobseeker/Signup";
import Homepage from "./components/public/Homepage";
import Login from "./components/public/Login";
import Navbar from "./components/public/Navbar";

const App = () => {
  return (
    <div>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
        <Route path="profile" element={<Profile></Profile>}></Route>
        <Route path="login" element={<Login></Login>}></Route>
        <Route path="signup" element={<SignUp></SignUp>}></Route>
      </Routes>
    </div>
  );
};

export default App;
