import React from "react";
import { menus, menusLogout, Path } from "../../../config/path.Config.ts";
import type { UserRole } from "../../../types/entities.ts";
import { Link } from "react-router-dom";
import "../../../index.css";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { ReactSVG } from "react-svg";
import LanguageSelector from "../../common/LanguageSelector/LanguageSelector.tsx";
const Navbar: React.FC<{ role: UserRole; userName: string }> = ({
  role,
  userName,
}) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo border-b">
          <div className="nav-logo-container">
            <div className="nav-title">
              <div className="nav-logo-f" translate="no">M</div>
              <div className="nav-logo-text" translate="no">Exchang</div>
            </div>
            <div className="role">{role}</div>
          </div>
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
        </div>
        <ul className="nav-menu border-b">
          {menus
            .filter((item) => item.roles.includes(role)) // กรองเมนูตาม Role ตรงนี้!
            .map((item) => (
              <li key={item.path}>
                <Link
                  className="link"
                  to={item.path}
                  onClick={() => {
                    // ปิดเมนูเมื่อคลิกที่ลิงก์ (สำหรับมือถือ)
                    const menu = document.querySelector(".navbar");
                    if (menu) {
                      menu.classList.remove("active");
                    }
                  }}
                >
                  <ReactSVG src={item.icon} className="nav-icon-svg" />
                  {item.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <ul className="nav-menu-bottom">
          <li>
            <Link className="link signed" to={Path.PROFILE}>
              <div className="t1">Signed in as</div>
              <div className="t2" translate="no">{userName}</div>
            </Link>
            <LanguageSelector />
          </li>
          {menusLogout
            .filter((item) => item.roles.includes(role)) // กรองเมนูตาม Role ตรงนี้!
            .map((item) => (
              <li key={item.path}>
                <Link className="link" to={item.path}>
                  <ReactSVG src={item.icon} className="nav-icon-svg" />

                  {item.title}
                 
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
