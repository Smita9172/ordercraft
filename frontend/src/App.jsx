import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Boms from "./pages/Boms";
import PurchaseOrders from "./pages/PurchaseOrders";
import Invoices from "./pages/Invoices";
import FeatureDetail from "./pages/FeatureDetail";

const Soon = ({ name }) => <h2>{name} (coming next)</h2>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="boms" element={<Soon name="BOM" />} />
            <Route path="purchase" element={<Soon name="Purchase Orders" />} />
            <Route path="invoices" element={<Soon name="Invoices" />} />
          </Route>
          <Route path="boms" element={<Boms />} />
<Route path="purchase" element={<PurchaseOrders />} />
<Route path="invoices" element={<Invoices />} />
<Route path="/features/:slug" element={<FeatureDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}