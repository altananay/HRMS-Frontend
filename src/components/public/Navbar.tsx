import { NavLink } from "react-router-dom";
import {
  DeleteFromLocalStorage,
  GetFromLocalStorage,
} from "../../services/LocalStorageService";
import { toast, ToastContainer } from "react-toastify";
import Dropdown from "../../utilities/custom-ui-components/dropdown/Dropdown";
import SignUpDropdown from "../../utilities/custom-ui-components/dropdown/SignUpDropdown";
import hrms from "../../assets/images/hrms.png";

const Navbar = () => {
  const renderNavbar = () => {
    if (GetFromLocalStorage("companyToken")) {
      return (
        <nav
          className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
          id="mainNav"
        >
          <div className="container px-5">
            <NavLink className="navbar-brand fw-bold" to="/">
              <img src={hrms} width="100"></img>
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              Menu
              <i className="bi-list"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ms-auto me-4 my-3 my-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link me-lg-3" to="/company">
                    Şirket Paneli
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link me-lg-3"
                    to="/"
                    onClick={() => {
                      DeleteFromLocalStorage("companyToken");
                      setTimeout(() => {
                        toast.warning(
                          "Çıkış yapıldı. Ana sayfaya yönlendirildiniz.",
                          {
                            position: toast.POSITION.BOTTOM_RIGHT,
                          }
                        );
                      }, 1000);
                    }}
                  >
                    Çıkış Yap
                  </NavLink>
                </li>
              </ul>
              <button
                className="btn btn-primary rounded-pill px-3 mb-2 mb-lg-0"
                data-bs-toggle="modal"
                data-bs-target="#feedbackModal"
              >
                <span className="d-flex align-items-center">
                  <NavLink
                    to="/contact"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    <span className="small">Bize Ulaşın</span>
                  </NavLink>
                </span>
              </button>
            </div>
          </div>
        </nav>
      );
    } else if (GetFromLocalStorage("token")) {
      return (
        <nav
          className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
          id="mainNav"
        >
          <div className="container px-5">
            <NavLink className="navbar-brand fw-bold" to="/">
              <img src={hrms} width="100"></img>
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              Menu
              <i className="bi-list"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ms-auto me-4 my-3 my-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link me-lg-3" to="/profile">
                    Profil
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link me-lg-3"
                    to="/"
                    onClick={() => {
                      DeleteFromLocalStorage("token");
                      setTimeout(() => {
                        toast.warning(
                          "Çıkış yapıldı. Ana sayfaya yönlendirildiniz.",
                          {
                            position: toast.POSITION.BOTTOM_RIGHT,
                          }
                        );
                      }, 1000);
                    }}
                  >
                    Çıkış Yap
                  </NavLink>
                </li>
              </ul>
              <button
                className="btn btn-primary rounded-pill px-3 mb-2 mb-lg-0"
                data-bs-toggle="modal"
                data-bs-target="#feedbackModal"
              >
                <span className="d-flex align-items-center">
                  <NavLink
                    to="/contact"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    <span className="small">Bize Ulaşın</span>
                  </NavLink>
                </span>
              </button>
            </div>
          </div>
        </nav>
      );
    } else {
      return (
        <nav
          className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
          id="mainNav"
        >
          <div className="container px-5">
            <NavLink className="navbar-brand fw-bold" to="/">
              <img src={hrms} width="100"></img>
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              Menu
              <i className="bi-list"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ms-auto me-4 my-3 my-lg-0">
                <li
                  className="nav-item nav-link me-lg-3"
                  style={{ color: "black" }}
                >
                  Giriş Yap
                </li>
                <Dropdown></Dropdown>
                <li
                  className="nav-item nav-link me-lg-3"
                  style={{ color: "black" }}
                >
                  Kayıt Ol
                </li>
                <SignUpDropdown></SignUpDropdown>
              </ul>
              <button
                className="btn btn-primary rounded-pill px-3 mb-2 mb-lg-0"
                data-bs-toggle="modal"
                data-bs-target="#feedbackModal"
              >
                <span className="d-flex align-items-center">
                  <NavLink
                    to="/contact"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    <span className="small">Bize Ulaşın</span>
                  </NavLink>
                </span>
              </button>
            </div>
          </div>
          <ToastContainer></ToastContainer>
        </nav>
      );
    }
  };

  return <>{renderNavbar()}</>;
};

export default Navbar;
