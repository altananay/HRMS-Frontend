import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { ReactComponent as CaretIcon } from "../../../assets/images/caret.svg";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import "./dropdown.css";
import { NavLink } from "react-router-dom";

const SignUpDropdown = () => {
  return (
    <>
      <CustomNavItem icon={<CaretIcon />}>
        <CustomDropdownMenu></CustomDropdownMenu>
      </CustomNavItem>
    </>
  );
};

function CustomNavItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="custom-nav-item">
      <a
        className="custom-icon-button"
        onClick={() => setOpen(!open)}
        style={{ textDecoration: "none" }}
      >
        {props.icon}
      </a>

      {open && props.children}
    </li>
  );
}

function CustomDropdownMenu() {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight);
  }, []);

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function CustomDropdownItem(props) {
    return (
      <a
        className="custom-menu-item custom-a"
        onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
        style={{ textDecoration: "none", marginBottom: "7px" }}
      >
        <span className="custom-icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="custom-icon-right" style={{ marginBottom: "20px" }}>
          {props.rightIcon}
        </span>
      </a>
    );
  }

  return (
    <div className="custom-dropdown" style={{ height: 100 }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === "main"}
        timeout={500}
        classNames="custom-menu-primary"
        unmountOnExit
        onEnter={calcHeight}
      >
        <div className="custom-menu">
          <NavLink to="/signup" style={{ textDecoration: "none" }}>
            <CustomDropdownItem leftIcon={<PersonAddIcon></PersonAddIcon>}>
              Bireysel Kayıt
            </CustomDropdownItem>
          </NavLink>

          <NavLink to="/companysignup" style={{textDecoration: "none"}}>
            <CustomDropdownItem leftIcon={<AddBusinessIcon></AddBusinessIcon>}>
              Kurumsal Kayıt
            </CustomDropdownItem>
          </NavLink>
        </div>
      </CSSTransition>
    </div>
  );
}

export default SignUpDropdown;