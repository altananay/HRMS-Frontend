import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import Sidebar from "./layouts/Sidebar";
import Statistics from "./layouts/Statistics";
import { useEffect, useState } from "react";
import { GetFromLocalStorage } from "../../services/LocalStorageService";
import jwtDecode from "jwt-decode";
import { getClaims, getUserId } from "../../services/JWTService";
import Notfound from "../public/Notfound";
import Loader from "react-loaders";
import "../../assets/style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../public/Navbar";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "firstName",
    headerName: "First name",
    width: 150,
    editable: true,
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    editable: true,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ""} ${params.row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const renderNotFound = () => {
    setTimeout(() => {
      return <Notfound></Notfound>;
    }, 1500);
  };

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
        setIsAuthenticated(true);
        id = getUserId(decodedJwt);
      }
    });
  }, []);

  return (
    <>
      <div id="main-wrapper">
        <div className="brand-logo">
          <a>
            <b className="logo-abbr"></b>
            <span className="logo-compact"></span>
            <span className="brand-title"></span>
          </a>
        </div>
      </div>
      <div className="nk-sidebar">
        <div className="nk-nav-scroll">
          <ul className="metismenu" id="menu">
            <li className="nav-label">Dashboard</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-speedometer menu-icon"></i>
                <span className="nav-text">Dashboard</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./index.html">Home 1</a>
                </li>
              </ul>
            </li>
            <li className="mega-menu mega-menu-sm">
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-globe-alt menu-icon"></i>
                <span className="nav-text">Layouts</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./layout-blank.html">Blank</a>
                </li>
                <li>
                  <a href="./layout-one-column.html">One Column</a>
                </li>
                <li>
                  <a href="./layout-two-column.html">Two column</a>
                </li>
                <li>
                  <a href="./layout-compact-nav.html">Compact Nav</a>
                </li>
                <li>
                  <a href="./layout-vertical.html">Vertical</a>
                </li>
                <li>
                  <a href="./layout-horizontal.html">Horizontal</a>
                </li>
                <li>
                  <a href="./layout-boxed.html">Boxed</a>
                </li>
                <li>
                  <a href="./layout-wide.html">Wide</a>
                </li>

                <li>
                  <a href="./layout-fixed-header.html">Fixed Header</a>
                </li>
                <li>
                  <a href="layout-fixed-sidebar.html">Fixed Sidebar</a>
                </li>
              </ul>
            </li>
            <li className="nav-label">Apps</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-envelope menu-icon"></i>{" "}
                <span className="nav-text">Email</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./email-inbox.html">Inbox</a>
                </li>
                <li>
                  <a href="./email-read.html">Read</a>
                </li>
                <li>
                  <a href="./email-compose.html">Compose</a>
                </li>
              </ul>
            </li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-screen-tablet menu-icon"></i>
                <span className="nav-text">Apps</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./app-profile.html">Profile</a>
                </li>
                <li>
                  <a href="./app-calender.html">Calender</a>
                </li>
              </ul>
            </li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-graph menu-icon"></i>{" "}
                <span className="nav-text">Charts</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./chart-flot.html">Flot</a>
                </li>
                <li>
                  <a href="./chart-morris.html">Morris</a>
                </li>
                <li>
                  <a href="./chart-chartjs.html">Chartjs</a>
                </li>
                <li>
                  <a href="./chart-chartist.html">Chartist</a>
                </li>
                <li>
                  <a href="./chart-sparkline.html">Sparkline</a>
                </li>
                <li>
                  <a href="./chart-peity.html">Peity</a>
                </li>
              </ul>
            </li>
            <li className="nav-label">UI Components</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-grid menu-icon"></i>
                <span className="nav-text">UI Components</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./ui-accordion.html">Accordion</a>
                </li>
                <li>
                  <a href="./ui-alert.html">Alert</a>
                </li>
                <li>
                  <a href="./ui-badge.html">Badge</a>
                </li>
                <li>
                  <a href="./ui-button.html">Button</a>
                </li>
                <li>
                  <a href="./ui-button-group.html">Button Group</a>
                </li>
                <li>
                  <a href="./ui-cards.html">Cards</a>
                </li>
                <li>
                  <a href="./ui-carousel.html">Carousel</a>
                </li>
                <li>
                  <a href="./ui-dropdown.html">Dropdown</a>
                </li>
                <li>
                  <a href="./ui-list-group.html">List Group</a>
                </li>
                <li>
                  <a href="./ui-media-object.html">Media Object</a>
                </li>
                <li>
                  <a href="./ui-modal.html">Modal</a>
                </li>
                <li>
                  <a href="./ui-pagination.html">Pagination</a>
                </li>
                <li>
                  <a href="./ui-popover.html">Popover</a>
                </li>
                <li>
                  <a href="./ui-progressbar.html">Progressbar</a>
                </li>
                <li>
                  <a href="./ui-tab.html">Tab</a>
                </li>
                <li>
                  <a href="./ui-typography.html">Typography</a>
                </li>
                <li>
                  <a href="./uc-nestedable.html">Nestedable</a>
                </li>
                <li>
                  <a href="./uc-noui-slider.html">Noui Slider</a>
                </li>
                <li>
                  <a href="./uc-sweetalert.html">Sweet Alert</a>
                </li>
                <li>
                  <a href="./uc-toastr.html">Toastr</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="widgets.html" aria-expanded="false">
                <i className="icon-badge menu-icon"></i>
                <span className="nav-text">Widget</span>
              </a>
            </li>
            <li className="nav-label">Forms</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-note menu-icon"></i>
                <span className="nav-text">Forms</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./form-basic.html">Basic Form</a>
                </li>
                <li>
                  <a href="./form-validation.html">Form Validation</a>
                </li>
                <li>
                  <a href="./form-step.html">Step Form</a>
                </li>
                <li>
                  <a href="./form-editor.html">Editor</a>
                </li>
                <li>
                  <a href="./form-picker.html">Picker</a>
                </li>
              </ul>
            </li>
            <li className="nav-label">Table</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-menu menu-icon"></i>
                <span className="nav-text">Table</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./table-basic.html" aria-expanded="false">
                    Basic Table
                  </a>
                </li>
                <li>
                  <a href="./table-datatable.html" aria-expanded="false">
                    Data Table
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-label">Pages</li>
            <li>
              <a
                className="has-arrow"
                href="javascript:void()"
                aria-expanded="false"
              >
                <i className="icon-notebook menu-icon"></i>
                <span className="nav-text">Pages</span>
              </a>
              <ul aria-expanded="false">
                <li>
                  <a href="./page-login.html">Login</a>
                </li>
                <li>
                  <a href="./page-register.html">Register</a>
                </li>
                <li>
                  <a href="./page-lock.html">Lock Screen</a>
                </li>
                <li>
                  <a
                    className="has-arrow"
                    href="javascript:void()"
                    aria-expanded="false"
                  >
                    Error
                  </a>
                  <ul aria-expanded="false">
                    <li>
                      <a href="./page-error-404.html">Error 404</a>
                    </li>
                    <li>
                      <a href="./page-error-403.html">Error 403</a>
                    </li>
                    <li>
                      <a href="./page-error-400.html">Error 400</a>
                    </li>
                    <li>
                      <a href="./page-error-500.html">Error 500</a>
                    </li>
                    <li>
                      <a href="./page-error-503.html">Error 503</a>
                    </li>
                  </ul>
                </li>
              </ul>
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
                  <h3 className="card-title text-white">Products Sold</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">4565</h2>
                    <p className="text-white mb-0">Jan - March 2019</p>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    <i className="fa fa-shopping-cart"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-2">
                <div className="card-body">
                  <h3 className="card-title text-white">Net Profit</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">$ 8541</h2>
                    <p className="text-white mb-0">Jan - March 2019</p>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    <i className="fa fa-money"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card gradient-3">
                <div className="card-body">
                  <h3 className="card-title text-white">New Customers</h3>
                  <div className="d-inline-block">
                    <h2 className="text-white">4565</h2>
                    <p className="text-white mb-0">Jan - March 2019</p>
                  </div>
                  <span className="float-right display-5 opacity-5">
                    <i className="fa fa-users"></i>
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
      </div>
    </>
  );
};

export default Dashboard;
