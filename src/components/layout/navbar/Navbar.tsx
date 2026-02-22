import React from "react";
import { menus, menusLogout } from "../../../config/path.Config.ts";
import type { UserRole } from "../../../types/entities.ts";
import { Link } from "react-router-dom";
import "../../../index.css";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";


const Navbar: React.FC<{ role: UserRole }> = ({ role }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <span>M</span>
          <div>
            {"Exchang".split("").map((char, index) => (
              <span key={index} style={{ display: "block" }}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <ul className="nav-menu">
          {menus
            .filter((item) => item.roles.includes(role)) // กรองเมนูตาม Role ตรงนี้!
            .map((item) => (
              <li key={item.path}>
                <Link className="link" to={item.path}>
                  {item.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <ul className="nav-menu-bottom">
          {menusLogout
            .filter((item) => item.roles.includes(role)) // กรองเมนูตาม Role ตรงนี้!
            .map((item) => (
              <li key={item.path}>
                <Link className="link" to={item.path}>
                  {item.title}
                </Link>
              </li>
            ))}
          <button
            className="Berger"
            onClick={() => {
              // เพิ่มฟังก์ชันสำหรับเปิด/ปิดเมนูในมือถือ
              const menu = document.querySelector(".navbar");
              if (menu) {
                menu.classList.toggle("active");
              }
            }}
          >
            <div>
              <FontAwesomeIcon icon={faBars} />
            </div>
          </button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
