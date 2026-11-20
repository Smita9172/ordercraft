import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errText } from "../utils/errText";

const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");
const n = (v) => Number(v || 0).toLocaleString("en-IN");

export default function PurchaseOrders() {
  const { canWrite } = useAuth();
  const writable = canWrite("purchase");

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(null);
  const [recv, setRecv] = useState({}); // { poItemId: qty }
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(() => {
    api
      .get("/purchase/orders/", { params: { status } })
      .then((res) => setRows(res.data.results))
      .catch((e) => setMsg({ type: "error", text: errText(e) }));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action, body, okText) => {
    setMsg({ type: "", text: "" });
    try {
      await api.post(`/purchase/orders/${id}/${action}/`, body || {});
      setMsg({ type: "ok", text: okText });
      setRecv({});
      load();
    } catch (err) {
      setMsg({ type: "error", text: errText(err) });
    }
  };

  const receivePartial = (po) => {
    const items = po.items
      .filter((i) => Number(recv[i.id]) > 0)
      .map((i) => ({ id: i.id, qty: Number(recv[i.id]) }));
    if (items.length === 0) return setMsg({ type: "error", text: "Receive qty daalo." });
    act(po.id, "receive", { items }, "Maal receive hua, stock update ho gaya.");
  };

  return (
    <div>
      <div className="page-head">
        <h2>Purchase Orders</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select">
          <option value="">All status</option>
          {["DRAFT", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {msg.text && <div className={msg.type === "ok" ? "ok" : "error"}>{msg.text}</div>}
      {rows.length === 0 && <p>Koi Purchase Order nahi. BOM page se banao.</p>}

      {rows.map((po) => {
        const canReceive = po.status === "SENT" || po.status === "PARTIALLY_RECEIVED";
        return (
          <div className="panel" key={po.id}>
            <div className="panel-head" onClick={() => setOpen(open === po.id ? null : po.id)}>
              <div>
                <strong>{po.po_no}</strong> to {po.vendor_name}
                {po.bom_no && <small> (from {po.bom_no})</small>}
              </div>
              <div className="panel-right">
                <b>{money(po.total_amount)}</b>
                <span className={`status ${po.status}`}>{po.status.replace("_", " ")}</span>
                <span>{open === po.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {open === po.id && (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th><th>Ordered</th><th>Received</th><th>Pending</th>
                      {writable && canReceive && <th>Receive now</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((i) => (
                      <tr key={i.id}>
                        <td>{i.product_name}</td>
                        <td>{n(i.ordered_qty)}</td>
                        <td>{n(i.received_qty)}</td>
                        <td>{n(i.pending_qty)}</td>
                        {writable && canReceive && (
                          <td>
                            <input className="qty" type="number" min="0" max={i.pending_qty}
                              value={recv[i.id] ?? ""}
                              onChange={(e) => setRecv({ ...recv, [i.id]: e.target.value })} />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {writable && (
                  <div className="panel-actions">
                    {po.status === "DRAFT" && (
                      <button onClick={() => act(po.id, "send", null, "PO vendor ko bhej diya (SENT).")}>
                        Send to Vendor
                      </button>
                    )}
                    {canReceive && (
                      <>
                        <button className="secondary" onClick={() => receivePartial(po)}>Receive entered qty</button>
                        <button onClick={() => act(po.id, "receive", null, "Poora maal receive hua, stock update ho gaya.")}>
                          Receive All
                        </button>
                      </>
                    )}
                    {["DRAFT", "SENT"].includes(po.status) && (
                      <button className="link danger" onClick={() => act(po.id, "cancel", null, "PO cancel ho gaya.")}>
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}