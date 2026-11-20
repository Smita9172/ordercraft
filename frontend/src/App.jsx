import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

const Soon = ({ name }) => <h2>{name} (coming next)</h2>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Soon name="Customers" />} />
            <Route path="vendors" element={<Soon name="Vendors" />} />
            <Route path="products" element={<Soon name="Products" />} />
            <Route path="orders" element={<Soon name="Sales Orders" />} />
            <Route path="boms" element={<Soon name="BOM" />} />
            <Route path="purchase" element={<Soon name="Purchase Orders" />} />
            <Route path="invoices" element={<Soon name="Invoices" />} />
          </Route>
          <Route path="customers" element={<Customers />} />
<Route path="vendors" element={<Vendors />} />
<Route path="products" element={<Products />} />
<Route path="orders" element={<Orders />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}