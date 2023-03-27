import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AddJobAdvertisement from "./components/company/AddJobAdvertisement";
import Charts from "./components/company/Charts";
import Dashboard from "./components/company/Dashboard";
import JobAdvertisements from "./components/company/JobAdvertisements";
import UpdateJobAdvertisement from "./components/company/UpdateJobAdvertisement";
import Profile from "./components/jobseeker/Profile";
import SignUp from "./components/jobseeker/Signup";
import Homepage from "./components/public/Homepage";
import Login from "./components/public/Login";
import Notfound from "./components/public/Notfound";

const App = () => {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
        <Route path="/profile" element={<Profile></Profile>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/signup" element={<SignUp></SignUp>}></Route>
        <Route path="*" element={<Notfound></Notfound>}></Route>
        <Route path="/company" element={<Dashboard></Dashboard>}></Route>
        <Route path="/company/charts" element={<Charts></Charts>}></Route>
        <Route path="/company/jobadvertisements" element={<JobAdvertisements></JobAdvertisements>}></Route>
        <Route path="/company/addjobadvertisement" element={<AddJobAdvertisement></AddJobAdvertisement>}></Route>
        <Route path="/company/updatejobadvertisement" element={<UpdateJobAdvertisement></UpdateJobAdvertisement>}></Route>
      </Routes>
    </div>
  );
};

export default App;