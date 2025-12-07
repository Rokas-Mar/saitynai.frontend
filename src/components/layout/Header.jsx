import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { userName, role, logout } = useAuth();

  const toggleMenu = () => setOpen((o) => !o);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">Org</span>
          <span className="logo-text">Manager</span>
        </Link>

        <nav className={`nav ${open ? "nav-open" : ""}`}>
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/users" className={navLinkClass}>
            Users
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Events
          </NavLink>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <div>
              <div className="user-name">{userName || "User"}</div>
              <div className="user-role">{role || "Role"}</div>
            </div>
          </div>
          <button className="btn btn-small" onClick={logout}>
            <NavLink to="/login">logout</NavLink>
          </button>

          <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
}
