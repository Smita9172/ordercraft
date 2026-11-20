import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import api from "../api/axios";

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const COLORS = ["#2563eb", "#0ea5a4", "#f59e0b", "#8b5cf6", "#ef4444", "#10b981", "#64748b"];

const toPie = (obj) =>
  Object.entries(obj || {}).map(([k, v]) => ({ name: k.replace("_", " "), value: v }));

function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reports/dashboard/")
      .then((res) => setData(res.data))
      .catch(() => setError("Dashboard load nahi hua."));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <p>Loading...</p>;

  const cards = [
    ["Total Orders", data.total_orders],
    ["Total Invoiced", money(data.total_invoiced)],
    ["Payment Received", money(data.total_received)],
    ["Outstanding", money(data.outstanding)],
    ["Pending POs", data.pending_pos],
  ];
  const orderPie = toPie(data.orders_by_status);
  const poPie = toPie(data.po_by_status);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="cards">
        {cards.map(([label, value]) => (
          <div className="card" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="panel pad">
          <h3>Orders by Status</h3>
          {orderPie.length === 0 ? <Empty text="Abhi koi order nahi." /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={orderPie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {orderPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel pad">
          <h3>Purchase Orders by Status</h3>
          {poPie.length === 0 ? <Empty text="Abhi koi PO nahi." /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={poPie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {poPie.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid2">
        <div className="panel pad">
          <h3>Top Customers (Invoiced)</h3>
          {data.top_customers.length === 0 ? (
            <Empty text="Invoice banne ke baad dikhega." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.top_customers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel pad">
          <h3>Monthly Sales</h3>
          {data.monthly_sales.length === 0 ? (
            <Empty text="Invoice banne ke baad dikhega." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="total" fill="#0ea5a4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel pad">
        <h3>Low Stock Raw Materials (below 50)</h3>
        {data.low_stock.length === 0 ? (
          <Empty text="Sab stock theek hai." />
        ) : (
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Stock</th></tr></thead>
            <tbody>
              {data.low_stock.map((p) => (
                <tr key={p.sku}>
                  <td>{p.sku}</td><td>{p.name}</td><td className="neg">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}