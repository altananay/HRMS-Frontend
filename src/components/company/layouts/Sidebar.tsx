import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from '@mui/icons-material/Add';

const Sidebar = () => {
  return (
    <aside
      className="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-4"
      id="sidenav-main"
    >
      <div className="sidenav-header">
        <a
          className="navbar-brand m-0"
          href=" https://demos.creative-tim.com/argon-dashboard/pages/dashboard.html "
          target="_blank"
        >
          <span className="ms-1 font-weight-bold">HRMS</span>
        </a>
      </div>
      <hr className="horizontal dark mt-0"></hr>
      <div
        className="collapse navbar-collapse  w-auto "
        id="sidenav-collapse-main"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/company" className="nav-link">
              <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <DashboardIcon style={{ color: "blue" }}></DashboardIcon>
              </div>
              <span className="nav-link-text ms-1">Dashboard</span>
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/company/charts" className="nav-link">
              <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <BarChartIcon style={{ color: "yellow" }}></BarChartIcon>
              </div>
              <span className="nav-link-text ms-1">Grafikler</span>
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/company/jobadvertisements" className="nav-link">
              <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <WorkIcon style={{ color: "brown" }}></WorkIcon>
              </div>
              <span className="nav-link-text ms-1">İş İlanlarım</span>
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/company/addjobadvertisement" className="nav-link">
              <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <AddIcon style={{color: "green"}}></AddIcon>
              </div>
              <span className="nav-link-text ms-1">İş İlanı Ekle</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
