import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList, Factory, Layers, LayoutDashboard, LogOut,
  Package, Receipt, ShoppingCart, Truck, Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/vendors", label: "Vendors", icon: Truck },
  { to: "/app/products", label: "Products", icon: Package },
  { to: "/app/orders", label: "Sales Orders", icon: ClipboardList },
  { to: "/app/boms", label: "BOM", icon: Layers },
  { to: "/app/purchase", label: "Purchase Orders", icon: ShoppingCart },
  { to: "/app/invoices", label: "Invoices", icon: Receipt },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand light"><Factory size={22} /> OrderCraft</div>
        <nav>
          {MENU.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/app"}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="user">
            <div className="avatar">{user.username[0].toUpperCase()}</div>
            <div>
              <strong>{user.username}</strong>
              <span className="badge">{user.role}</span>
            </div>
          </div>
          <button className="btn ghost" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}