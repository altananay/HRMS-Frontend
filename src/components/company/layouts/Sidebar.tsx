import DashboardIcon from "@mui/icons-material/Dashboard";
import { DeleteFromLocalStorage } from "../../../services/LocalStorageService";
import WorkIcon from "@mui/icons-material/Work";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink } from "react-router-dom";
import hrms from "../../../assets/images/hrms.png";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';

const Sidebar = () => {
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
                <DashboardIcon
                  style={{ color: "blue", marginRight: "5px" }}
                ></DashboardIcon>
                <span className="nav-text">Dashboard</span>
              </a>
            </li>
            <li className="mega-menu mega-menu-sm">
              <a className="has-arrow" aria-expanded="false">
                <WorkIcon
                  style={{
                    color: "rgba(214, 104, 17, 254)",
                    marginRight: "5px",
                  }}
                ></WorkIcon>
                <span className="nav-text">İş İlanı İşlemleri</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <NavLink
                    to="/company/jobadvertisements"
                    className="has-arrow"
                    aria-expanded="false"
                    style={{textDecoration: "none"}}
                  >
                    <FormatListBulletedIcon
                      style={{
                        color: "rgba(255, 94, 36, 194)",
                        marginRight: "5px",
                      }}
                    ></FormatListBulletedIcon>
                    <span className="nav-text">İş ilanlarım</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/company/addjobadvertisement" className="has-arrow" aria-expanded="false" style={{textDecoration: "none"}}>
                    <EditIcon
                      style={{
                        color: "rgba(255, 94, 36, 194)",
                        marginRight: "5px",
                      }}
                    ></EditIcon>
                    <span className="nav-text">İş ilanı ekle</span>
                  </NavLink>
                </li>
              </ul>
            </li>
            <li>
              <a className="has-arrow" aria-expanded="false">
                <EmailIcon
                  style={{ color: "green", marginRight: "5px" }}
                ></EmailIcon>
                <span className="nav-text">Mail</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a className="has-arrow" aria-expanded="false">
                    <SendIcon
                      style={{
                        color: "green",
                        marginRight: "5px",
                      }}
                    ></SendIcon>
                    <span className="nav-text">Mail Gönder</span>
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a className="has-arrow" aria-expanded="false">
                <PeopleAltIcon
                  style={{ color: "red", marginRight: "5px" }}
                ></PeopleAltIcon>
                <span className="nav-text">Çalışanlarımız</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a className="has-arrow" aria-expanded="false">
                    <AccountCircleIcon
                      style={{ color: "purple", marginRight: "5px" }}
                    ></AccountCircleIcon>
                    <span className="nav-text">Çalışan Profilleri</span>
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <NavLink
                to="/"
                onClick={() => DeleteFromLocalStorage("companyToken")}
                style={{ textDecoration: "none" }}
                className="has-arrow"
                aria-expanded="false"
              >
                <LogoutIcon
                  style={{
                    color: "rgba(214, 190, 48, 48)",
                    marginRight: "5px",
                  }}
                ></LogoutIcon>
                <span className="nav-text">Çıkış Yap</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
