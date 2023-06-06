import { Route, Routes } from "react-router-dom";
import AddJobAdvertisement from "./components/company/AddJobAdvertisement";
import Charts from "./components/company/Charts";
import Dashboard from "./components/company/Dashboard";
import JobAdvertisements from "./components/company/JobAdvertisements";
import UpdateJobAdvertisement from "./components/company/UpdateJobAdvertisement";
import Profile from "./components/jobseeker/Profile";
import SignUp from "./components/jobseeker/Signup";
import Homepage from "./components/public/Homepage";
import Login from "./components/jobseeker/Login";
import Notfound from "./components/public/Notfound";
import CvCreate from "./components/jobseeker/CvCreate";
import "./App.scss"
import AdminDashboard from "./components/admin/AdminDashboard";
import CompanyLogin from "./components/company/CompanyLogin";
import CompanySignUp from "./components/company/CompanySignup";
import Contact from "./components/public/Contact";

const App = () => {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
        <Route path="/profile" element={<Profile></Profile>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/signup" element={<SignUp></SignUp>}></Route>
        <Route path="/cv-create" element={<CvCreate></CvCreate>}></Route>
        <Route path="*" element={<Notfound></Notfound>}></Route>
        <Route path="/company" element={<Dashboard></Dashboard>}></Route>
        <Route path="/company/charts" element={<Charts deparments={null}></Charts>}></Route>
        <Route path="/company/jobadvertisements" element={<JobAdvertisements></JobAdvertisements>}></Route>
        <Route path="/company/addjobadvertisement" element={<AddJobAdvertisement></AddJobAdvertisement>}></Route>
        <Route path="/company/updatejobadvertisement" element={<UpdateJobAdvertisement></UpdateJobAdvertisement>}></Route>
        <Route path="/admin" element={<AdminDashboard></AdminDashboard>}></Route>
        <Route path="/companysignup" element={<CompanySignUp></CompanySignUp>}></Route>
        <Route path="/companylogin" element={<CompanyLogin></CompanyLogin>}></Route>
        <Route path="/contact" element={<Contact></Contact>}></Route>
        <Route path="/cvcreate" element={<CvCreate></CvCreate>}></Route>
      </Routes>
    </div>
  );
};

export default App;