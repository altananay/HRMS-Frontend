import { NavLink } from "react-router-dom";
import { DeleteFromLocalStorage } from "../../services/LocalStorageService";
import { toast, ToastContainer } from "react-toastify";

const Navbar = ({ isAuthenticated }) => {
  return isAuthenticated ? (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
      id="mainNav"
    >
      <div className="container px-5">
        <NavLink className="navbar-brand fw-bold" to="/">
          HRMS
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
              <NavLink className="nav-link me-lg-3" to="/profile" state={isAuthenticated}>
                Profil
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link me-lg-3" to="/" onClick={() => {
                DeleteFromLocalStorage("token")
                isAuthenticated = false
                setTimeout(() => {
                  toast.warning("Çıkış yapıldı. Ana sayfaya yönlendirildiniz.", {
                    position: toast.POSITION.BOTTOM_RIGHT
                  })
                }, 1000);
              }}>
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
              <span className="small">Bize Ulaşın</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  ) : (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
      id="mainNav"
    >
      <div className="container px-5">
        <NavLink className="navbar-brand fw-bold" to="/">
          HRMS
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
              <NavLink className="nav-link me-lg-3" to="/login">
                Giriş Yap
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link me-lg-3" to="/signup">
                Kayıt Ol
              </NavLink>
            </li>
          </ul>
          <button
            className="btn btn-primary rounded-pill px-3 mb-2 mb-lg-0"
            data-bs-toggle="modal"
            data-bs-target="#feedbackModal"
          >
            <span className="d-flex align-items-center">
              <span className="small">Bize Ulaşın</span>
            </span>
          </button>
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </nav>
  );
};

export default Navbar;
