import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errText } from "../components/CrudPage";

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Har status par kaun se buttons dikhenge
const NEXT = {
  DRAFT: [["CONFIRMED", "Confirm"], ["CANCELLED", "Cancel"]],
  CONFIRMED: [["IN_PRODUCTION", "Start Production"], ["CANCELLED", "Cancel"]],
  IN_PRODUCTION: [["DISPATCHED", "Dispatch"]],
  INVOICED: [["CLOSED", "Close"]],
};

const emptyItem = { product: "", quantity: 1 };

export default function Orders() {
  const { canWrite } = useAuth();
  const writable = canWrite("orders");

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/sales/orders/", { params: { page, search, status } })
      .then((res) => {
        setRows(res.data.results);
        setCount(res.data.count);
      })
      .catch((e) => setError(errText(e)));
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.get("/masters/customers/", { params: { page_size: 100 } })
      .then((r) => setCustomers(r.data.results));
    api.get("/masters/products/", { params: { product_type: "FINISHED", page_size: 100 } })
      .then((r) => setProducts(r.data.results));
  }, []);

  const priceOf = (id) => Number(products.find((p) => p.id === Number(id))?.price || 0);

  const openAdd = () => {
    setForm({ customer: "", delivery_date: "", notes: "", items: [{ ...emptyItem }] });
    setEditId(null);
    setError("");
  };

  const openEdit = (o) => {
    setForm({
      customer: o.customer,
      delivery_date: o.delivery_date || "",
      notes: o.notes || "",
      items: o.items.map((i) => ({ product: i.product, quantity: i.quantity })),
    });
    setEditId(o.id);
    setError("");
  };

  const setItem = (idx, key, value) => {
    const items = form.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    setForm({ ...form, items });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  // Derived state: total rows se hi nikalta hai
  const liveTotal = form
    ? form.items.reduce((s, it) => s + priceOf(it.product) * Number(it.quantity || 0), 0)
    : 0;

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const items = form.items
      .filter((it) => it.product && Number(it.quantity) > 0)
      .map((it) => ({ product: Number(it.product), quantity: Number(it.quantity) }));
    if (!form.customer) return setError("Customer chuno.");
    if (items.length === 0) return setError("Kam se kam ek product add karo.");

    const payload = {
      customer: Number(form.customer),
      delivery_date: form.delivery_date || null,
      notes: form.notes,
      items,
    };
    try {
      if (editId) await api.put(`/sales/orders/${editId}/`, payload);
      else await api.post("/sales/orders/", payload);
      setForm(null);
      load();
    } catch (err) {
      setError(errText(err));
    }
  };

  const changeStatus = async (id, newStatus, label) => {
    if (!window.confirm(`${label} karna hai?`)) return;
    try {
      await api.post(`/sales/orders/${id}/set_status/`, { status: newStatus });
      load();
    } catch (err) {
      alert(errText(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Draft order delete karna hai?")) return;
    try {
      await api.delete(`/sales/orders/${id}/`);
      load();
    } catch (err) {
      alert(errText(err));
    }
  };

  const pages = Math.max(1, Math.ceil(count / 10));

  return (
    <div>
      <div className="page-head">
        <h2>Sales Orders</h2>
        {writable && <button onClick={openAdd}>+ New Order</button>}
      </div>

      <div className="filters">
        <input
          className="search"
          placeholder="Search order no / customer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All status</option>
          {["DRAFT","CONFIRMED","IN_PRODUCTION","DISPATCHED","INVOICED","CLOSED","CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && !form && <div className="error">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Order No</th><th>Customer</th><th>Date</th><th>Items</th>
            <th>Total</th><th>Status</th>{writable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>{o.order_no}</td>
              <td>{o.customer_name}</td>
              <td>{o.order_date}</td>
              <td>{o.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}</td>
              <td>{money(o.total_amount)}</td>
              <td><span className={`status ${o.status}`}>{o.status.replace("_", " ")}</span></td>
              {writable && (
                <td className="actions">
                  {o.status === "DRAFT" && (
                    <>
                      <button className="link" onClick={() => openEdit(o)}>Edit</button>
                      <button className="link danger" onClick={() => remove(o.id)}>Delete</button>
                    </>
                  )}
                  {(NEXT[o.status] || []).map(([s, label]) => (
                    <button key={s} className={s === "CANCELLED" ? "link danger" : "small"}
                      onClick={() => changeStatus(o.id, s, label)}>
                      {label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={7}>Koi order nahi.</td></tr>}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} / {pages} ({count} orders)</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {form && (
        <div className="modal-bg">
          <form className="modal wide" onSubmit={save}>
            <h3>{editId ? "Edit Order" : "New Sales Order"}</h3>

            <label>Customer
              <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                <option value="">-- select customer --</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label>Delivery Date
              <input type="date" value={form.delivery_date}
                onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
            </label>

            <label>Notes
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>

            <table className="items">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Qty</th><th>Line Total</th><th></th></tr>
              </thead>
              <tbody>
                {form.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <select value={it.product} onChange={(e) => setItem(idx, "product", e.target.value)}>
                        <option value="">-- product --</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td>{money(priceOf(it.product))}</td>
                    <td>
                      <input type="number" min="1" value={it.quantity}
                        onChange={(e) => setItem(idx, "quantity", e.target.value)} />
                    </td>
                    <td>{money(priceOf(it.product) * Number(it.quantity || 0))}</td>
                    <td>
                      {form.items.length > 1 && (
                        <button type="button" className="link danger" onClick={() => removeItem(idx)}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="secondary" onClick={addItem}>+ Add item</button>

            <div className="total">Total: <strong>{money(liveTotal)}</strong></div>

            {error && <div className="error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setForm(null)}>Cancel</button>
              <button>Save Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}