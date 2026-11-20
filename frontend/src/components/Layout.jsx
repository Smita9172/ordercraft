import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MENU = [
  { to: "/", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/vendors", label: "Vendors" },
  { to: "/products", label: "Products" },
  { to: "/orders", label: "Sales Orders" },
  { to: "/boms", label: "BOM" },
  { to: "/purchase", label: "Purchase Orders" },
  { to: "/invoices", label: "Invoices" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>OrderCraft</h2>
        {MENU.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.to === "/"}>
            {m.label}
          </NavLink>
        ))}
      </aside>
      <div className="main">
        <header className="topbar">
          <span>
            {user.username} <span className="badge">{user.role}</span>
          </span>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}