import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errText } from "../utils/errText";

const money = (v) => "₹" + Number(v || 0).toLocaleString("en-IN");
const today = () => new Date().toISOString().slice(0, 10);

export default function Invoices() {
  const { canWrite } = useAuth();
  const writable = canWrite("invoices");

  const [rows, setRows] = useState([]);
  const [dispatched, setDispatched] = useState([]);
  const [open, setOpen] = useState(null);
  const [pay, setPay] = useState({ amount: "", method: "UPI", reference: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = useCallback(() => {
    api.get("/billing/invoices/", { params: { page_size: 100 } })
      .then((r) => setRows(r.data.results))
      .catch((e) => setMsg({ type: "error", text: errText(e) }));
    api.get("/sales/orders/", { params: { status: "DISPATCHED", page_size: 100 } })
      .then((r) => setDispatched(r.data.results));
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async (orderId) => {
    setMsg({ type: "", text: "" });
    try {
      await api.post("/billing/invoices/generate/", { order: orderId });
      setMsg({ type: "ok", text: "Invoice ban gaya." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: errText(err) });
    }
  };

  const addPayment = async (invoice) => {
    setMsg({ type: "", text: "" });
    try {
      await api.post("/billing/payments/", {
        invoice: invoice.id,
        amount: pay.amount,
        method: pay.method,
        reference: pay.reference,
        payment_date: today(),
      });
      setPay({ amount: "", method: "UPI", reference: "" });
      setMsg({ type: "ok", text: "Payment record ho gayi." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: errText(err) });
    }
  };

  return (
    <div>
      <div className="page-head"><h2>Invoices & Payments</h2></div>
      {msg.text && <div className={msg.type === "ok" ? "ok" : "error"}>{msg.text}</div>}

      {writable && dispatched.length > 0 && (
        <div className="panel">
          <div className="panel-head"><strong>Dispatched orders (invoice banana baaki)</strong></div>
          <table>
            <tbody>
              {dispatched.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_no}</td>
                  <td>{o.customer_name}</td>
                  <td>{money(o.total_amount)}</td>
                  <td><button className="small" onClick={() => generate(o.id)}>Generate Invoice</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && <p>Koi invoice nahi.</p>}

      {rows.map((inv) => (
        <div className="panel" key={inv.id}>
          <div className="panel-head" onClick={() => setOpen(open === inv.id ? null : inv.id)}>
            <div><strong>{inv.invoice_no}</strong> | {inv.order_no} | {inv.customer_name}</div>
            <div className="panel-right">
              <span>Total <b>{money(inv.total_amount)}</b></span>
              <span>Balance <b className={Number(inv.balance_amount) > 0 ? "neg" : "pos"}>{money(inv.balance_amount)}</b></span>
              <span className={`status ${inv.status === "PAID" ? "CLOSED" : inv.status === "PARTIAL" ? "IN_PRODUCTION" : "CANCELLED"}`}>
                {inv.status}
              </span>
            </div>
          </div>

          {open === inv.id && (
            <>
              <table>
                <tbody>
                  <tr><td>Subtotal</td><td>{money(inv.subtotal)}</td></tr>
                  <tr><td>Tax ({Number(inv.tax_rate)}%)</td><td>{money(inv.tax_amount)}</td></tr>
                  <tr><td><b>Total</b></td><td><b>{money(inv.total_amount)}</b></td></tr>
                  <tr><td>Paid</td><td>{money(inv.paid_amount)}</td></tr>
                </tbody>
              </table>

              {inv.payments.length > 0 && (
                <table>
                  <thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Amount</th></tr></thead>
                  <tbody>
                    {inv.payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.receipt_no}</td><td>{p.payment_date}</td>
                        <td>{p.method}</td><td>{money(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {writable && inv.status !== "PAID" && (
                <div className="panel-actions pay">
                  <input className="qty" type="number" placeholder="Amount" value={pay.amount}
                    onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                  <select className="filter-select" value={pay.method}
                    onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                    {["CASH", "UPI", "BANK", "CHEQUE"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <input className="qty" placeholder="Reference" value={pay.reference}
                    onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
                  <button onClick={() => addPayment(inv)}>Add Payment</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}