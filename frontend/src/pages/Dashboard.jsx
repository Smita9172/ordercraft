import { useEffect, useState } from "react";
import api from "../api/axios";

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/reports/dashboard/")
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
    </div>
  );
}