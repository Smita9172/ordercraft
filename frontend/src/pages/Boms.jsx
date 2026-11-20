

import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errText } from "../utils/errText";

const n = (v) => Number(v || 0).toLocaleString("en-IN");

export default function Boms() {
  const { canWrite } = useAuth();
  const writable = canWrite("boms");

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(() => {
    api
      .get("/bom/boms/")
      .then((res) => setRows(res.data.results))
      .catch((e) => setMsg({ type: "error", text: errText(e) }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id, action, okText) => {
    setMsg({ type: "", text: "" });
    try {
      await api.post(`/bom/boms/${id}/${action}/`);
      setMsg({ type: "ok", text: okText });
      load();
    } catch (err) {
      setMsg({ type: "error", text: errText(err) });
    }
  };

  const shortageCount = (b) => b.items.filter((i) => Number(i.shortage_qty) > 0).length;

  return (
    <div>
      <div className="page-head"><h2>Bill of Materials</h2></div>
      {msg.text && <div className={msg.type === "ok" ? "ok" : "error"}>{msg.text}</div>}

      {rows.length === 0 && <p>Koi BOM nahi. Order Confirm karne par BOM apne aap banta hai.</p>}

      {rows.map((b) => (
        <div className="panel" key={b.id}>
          <div className="panel-head" onClick={() => setOpen(open === b.id ? null : b.id)}>
            <div>
              <strong>{b.bom_no}</strong> for {b.order_no} ({b.customer_name})
            </div>
            <div className="panel-right">
              {shortageCount(b) > 0
                ? <span className="status CANCELLED">{shortageCount(b)} shortage</span>
                : <span className="status CLOSED">Stock OK</span>}
              <span>{open === b.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {open === b.id && (
            <>
              <table>
                <thead>
                  <tr><th>Component</th><th>Required</th><th>Available</th><th>Shortage</th></tr>
                </thead>
                <tbody>
                  {b.items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.component_name}</td>
                      <td>{n(i.required_qty)} {i.unit}</td>
                      <td>{n(i.available_qty)}</td>
                      <td className={Number(i.shortage_qty) > 0 ? "neg" : "pos"}>
                        {n(i.shortage_qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {writable && (
                <div className="panel-actions">
                  <button className="secondary" onClick={() => run(b.id, "regenerate", "BOM dobara generate hua.")}>
                    Regenerate
                  </button>
                  <button onClick={() => run(b.id, "create_po", "Purchase Order(s) ban gaye. Purchase Orders page dekho.")}>
                    Create Purchase Orders
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}