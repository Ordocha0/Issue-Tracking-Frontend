// Header.jsx
import style from "./index.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdNotifications,
  MdLogout,
  MdSettings,
  MdPerson,
  MdDashboard,
  MdAssignment,
  MdPeople,
} from "react-icons/md";
import { useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../../loginContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
  { to: "/issues",    label: "Issues",    icon: MdAssignment },
  // { to: "/staff",     label: "Staff",     icon: MdPeople },
];

const Header = () => {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const {
    firstName,
    lastName,
    userName,
    role,
    email,
    phone,
    user_id,
    national_id,
    profile_pic,
    setToken,
    setUserName,
  } = loginContext;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : userName || "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hue = [...displayName].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstTimeLogin");
    setToken?.(null);
    setUserName?.(null);
    navigate("/login");
  };

  return (
    <header className={style.header}>
      {/* ---- Left: greeting ---- */}
      <div className={style.titleDiv}>
        <h1>Good Morning, {userName}</h1>
        <h2>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
      </div>

      {/* ---- Middle: primary navigation ---- */}
      <nav className={style.nav} aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${style.navLink} ${isActive ? style.navLinkActive : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ---- Right: search + notifications + avatar ---- */}
      <div className={style.searchDiv}>
        {/* <input type="search" placeholder="Search" className={style.search} />

        <button className={style.iconBtn} aria-label="Notifications">
          <MdNotifications size={22} />
          <span className={style.notifDot} />
        </button> */}

        <button
          ref={avatarRef}
          className={style.avatarBtn}
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open user menu"
        >
          {profile_pic ? (
            <img src={profile_pic} alt={displayName} className={style.avatarImg} />
          ) : (
            <div
              className={style.avatar}
              style={{
                background: `hsl(${hue}, 65%, 92%)`,
                color: `hsl(${hue}, 55%, 35%)`,
              }}
            >
              {initials}
            </div>
          )}
        </button>

        {/* ---- Dropdown ---- */}
        {menuOpen && (
          <div
            ref={menuRef}
            className={style.menu}
            role="menu"
            aria-label="User menu"
          >
            <div className={style.menuHeader}>
              {profile_pic ? (
                <img
                  src={profile_pic}
                  alt={displayName}
                  className={style.menuAvatarImg}
                />
              ) : (
                <div
                  className={style.menuAvatar}
                  style={{
                    background: `hsl(${hue}, 65%, 92%)`,
                    color: `hsl(${hue}, 55%, 35%)`,
                  }}
                >
                  {initials}
                </div>
              )}
              <div className={style.menuIdentity}>
                <p className={style.menuName}>{displayName}</p>
                <p className={style.menuHandle}>@{userName || "user"}</p>
                <span className={style.menuRole}>{role || "user"}</span>
              </div>
            </div>

            <div className={style.menuDetails}>
              {email && <DetailRow label="Email" value={email} />}
              {phone && <DetailRow label="Phone" value={phone} />}
              {national_id && <DetailRow label="National ID" value={national_id} />}
              {user_id && (
                <DetailRow
                  label="User ID"
                  value={
                    String(user_id).slice(0, 12) +
                    (String(user_id).length > 12 ? "…" : "")
                  }
                />
              )}
            </div>

            <div className={style.menuActions}>
              <button
                className={style.menuItem}
                onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                role="menuitem"
              >
                <MdPerson size={18} />
                <span>View Profile</span>
              </button>
              {/* <button
                className={style.menuItem}
                onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                role="menuitem"
              >
                <MdSettings size={18} />
                <span>Settings</span>
              </button> */}
            </div>

            <div className={style.menuFooter}>
              <button
                className={`${style.menuItem} ${style.menuItemDanger}`}
                onClick={handleLogout}
                role="menuitem"
              >
                <MdLogout size={18} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const DetailRow = ({ label, value }) => (
  <div className={style.detailRow}>
    <span className={style.detailLabel}>{label}</span>
    <span className={style.detailValue} title={value}>
      {value}
    </span>
  </div>
);

export default Header;