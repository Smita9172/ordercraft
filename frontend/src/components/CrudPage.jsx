import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errText } from "../utils/errText";

export default function CrudPage({ title, module, endpoint, columns, fields }) {
  const { canWrite } = useAuth();
  const writable = canWrite(module);

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null); // null = modal band
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({});

  const load = useCallback(() => {
    api
      .get(endpoint, { params: { page, search } })
      .then((res) => {
        setRows(res.data.results);
        setCount(res.data.count);
      })
      .catch((e) => setError(errText(e)));
  }, [endpoint, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // select fields ke options (jaise product ka vendor)
  useEffect(() => {
    fields
      .filter((f) => f.type === "select")
      .forEach((f) => {
        api.get(f.optionsFrom, { params: { page_size: 100 } }).then((res) =>
          setOptions((o) => ({ ...o, [f.name]: res.data.results }))
        );
      });
  }, [fields]);

  const openAdd = () => {
    const empty = {};
    fields.forEach((f) => (empty[f.name] = f.default ?? ""));
    setForm(empty);
    setEditId(null);
    setError("");
  };

  const openEdit = (row) => {
    const data = {};
    fields.forEach((f) => (data[f.name] = row[f.name] ?? ""));
    setForm(data);
    setEditId(row.id);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form };
    fields.forEach((f) => {
      if (f.type === "select" && payload[f.name] === "") payload[f.name] = null;
    });
    try {
      if (editId) await api.put(`${endpoint}${editId}/`, payload);
      else await api.post(endpoint, payload);
      setForm(null);
      load();
    } catch (err) {
      setError(errText(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Pakka delete karna hai?")) return;
    try {
      await api.delete(`${endpoint}${id}/`);
      load();
    } catch (err) {
      alert(errText(err));
    }
  };

  const pages = Math.max(1, Math.ceil(count / 10));

  return (
    <div>
      <div className="page-head">
        <h2>{title}</h2>
        {writable && <button onClick={openAdd}>+ Add</button>}
      </div>

      <input
        className="search"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {error && !form && <div className="error">{error}</div>}

      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            {writable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? "-")}</td>
              ))}
              {writable && (
                <td>
                  <button className="link" onClick={() => openEdit(r)}>Edit</button>
                  <button className="link danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1}>Koi record nahi.</td></tr>
          )}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} / {pages} ({count} records)</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {form && (
        <div className="modal-bg">
          <form className="modal" onSubmit={save}>
            <h3>{editId ? "Edit" : "Add"} {title}</h3>
            {fields.map((f) => (
              <label key={f.name}>
                {f.label}
                {f.type === "select" ? (
                  <select
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  >
                    <option value="">-- none --</option>
                    {(options[f.name] || []).map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                ) : f.type === "choice" ? (
                  <select
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  >
                    {f.choices.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    step={f.type === "number" ? "0.01" : undefined}
                    value={form[f.name] ?? ""}
                    required={f.required}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </label>
            ))}
            {error && <div className="error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setForm(null)}>Cancel</button>
              <button>Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}