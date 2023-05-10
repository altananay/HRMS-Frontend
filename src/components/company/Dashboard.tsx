import { useEffect, useState } from "react";
import { DeleteFromLocalStorage, GetFromLocalStorage } from "../../services/LocalStorageService";
import jwtDecode from "jwt-decode";
import { getClaims, getUserId } from "../../services/JWTService";
import "../../assets/style.css";
import hrms from "../../assets/images/hrms.png";
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Charts from "./Charts";
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from "react-router-dom";
import { getById } from "../../services/EmployerService";
import { Employer } from "../../contracts/Employer";

const Dashboard = () => {

  const [employer, setEmployer] = useState<Employer>();

  useEffect(() => {
    let jwt = GetFromLocalStorage("companyToken");
    let decodedJwt;
    let roles;
    let id;

    if (jwt) {
      decodedJwt = jwtDecode(jwt);
      roles = getClaims(decodedJwt);
    }

    roles!?.map((role) => {
      if (role == "employer") {
        id = getUserId(decodedJwt);
      }
    });
    
    getById(id).then(response => {
      setEmployer(response.data.data)
    }).catch(error => {
      console.log(error)
    })
  }, []);

  return (
    <>
      <img
        src={hrms}
        width="200"
        style={{ marginTop: "20px", marginLeft: "20px" }}
      ></img>
      <div className="nk-sidebar">
        <div className="nk-nav-scroll">
          <ul className="metismenu" id="menu">
            <li>
              <a className="has-arrow" aria-expanded="false">
                <DashboardIcon style={{color: "blue", marginRight: "5px"}}></DashboardIcon>
                <span className="nav-text">Dashboard</span>
              </a>
            </li>
            <li className="mega-menu mega-menu-sm">
              <a className="has-arrow" aria-expanded="false">
                <WorkIcon style={{color: 'rgba(214, 104, 17, 254)', marginRight: "5px"}}></WorkIcon>
                <span className="nav-text">İş İlanı İşlemleri</span>
              </a>
            </li>
            <li>
              <a className="has-arrow" aria-expanded="false">
                <EmailIcon style={{color: "green", marginRight: "5px"}}></EmailIcon>
                <span className="nav-text">Mail</span>
              </a>
              <ul aria-expanded="false">
                <li>
                <a className="has-arrow" aria-expanded="false">
                <SendIcon style={{color: "rgba(255, 94, 36, 194)", marginRight: "5px"}}></SendIcon>
                <span className="nav-text">Mail Gönder</span>
              </a>
                </li>
              </ul>
            </li>
            <li>
              <a className="has-arrow" aria-expanded="false">
                <PeopleAltIcon style={{color: "red", marginRight: "5px"}}></PeopleAltIcon>
                <span className="nav-text">Çalışanlarımız</span>
              </a>
              <ul aria-expanded="false">
                <li>
                <a className="has-arrow" aria-expanded="false">
                <AccountCircleIcon style={{color: "purple", marginRight: "5px"}}></AccountCircleIcon>
                <span className="nav-text">Çalışan Profilleri</span>
                </a>
                </li>
              </ul>
            </li>
            <li>
              <NavLink to="/" onClick={() => DeleteFromLocalStorage("companyToken")} style={{textDecoration: "none"}} className="has-arrow" aria-expanded="false">
                <LogoutIcon style={{color: "rgba(214, 190, 48, 48)", marginRight: "5px"}}></LogoutIcon>
                <span className="nav-text">Çıkış Yap</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="content-body">
        <div className="container-fluid mt-3">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-1">
                <div className="card-body">
                  <h3 className="card-title text-white">Çalışan Sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">{employer?.numberOfEmployees}</h2>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-2">
                <div className="card-body">
                  <h3 className="card-title text-white">İş ilanı sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">{employer?.companyPhone}</h2>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-3">
                <div className="card-body">
                  <h3 className="card-title text-white">Sektör sayısı</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">{employer?.sector.length}</h2>
                  </div>
                  <span className="float-right display-5 opacity-5">
  
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-4">
                <div className="card-body">
                  <h3 className="card-title text-white">
                    Customer Satisfaction
                  </h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">99%</h2>
                    <p className="text-white mb-0">Jan - March 2019</p>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    <i className="fa fa-heart"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Charts deparments={employer?.departments}></Charts>
      </div>
      
    </>
  );
};

export default Dashboard;
