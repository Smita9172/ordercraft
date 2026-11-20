import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Boxes, ClipboardList, Factory,
  FileText, ShieldCheck, ShoppingCart,
} from "lucide-react";

const FEATURES = [
  { icon: ClipboardList, title: "Sales Orders", text: "Create orders with multiple items and track every status from draft to dispatch." },
  { icon: Boxes, title: "Automatic BOM", text: "Material list is generated from product recipes, with live shortage calculation." },
  { icon: ShoppingCart, title: "Purchase Orders", text: "Vendor-wise purchase orders from shortages, with goods receipt and stock update." },
  { icon: FileText, title: "Invoicing & Payments", text: "GST invoices, partial payments and instant outstanding balance." },
  { icon: ShieldCheck, title: "Role-Based Access", text: "Admin, Sales, Purchase and Accounts see and do only what they should." },
  { icon: BarChart3, title: "Reports & Analytics", text: "Dashboard with sales, outstanding payments and pending purchase orders." },
];

const STEPS = [
  "Sales Order", "BOM", "Purchase Order", "Goods Received",
  "Dispatch", "Invoice", "Payment",
];

const STACK = ["React", "Django", "REST Framework", "JWT", "MySQL"];

export default function Home() {
  return (
    <div className="home">
      <nav className="home-nav">
        <div className="brand"><Factory size={22} /> OrderCraft</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#stack">Tech</a>
          <Link to="/login" className="btn">Login</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <span className="pill">Manufacturing Order Management</span>
          <h1>Run your factory orders <span>from one place</span></h1>
          <p>
            OrderCraft automates sales orders, bill of materials, purchasing,
            invoicing and payment tracking, so your team spends time building
            products, not chasing spreadsheets.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn lg">Get Started <ArrowRight size={18} /></Link>
            <a href="#workflow" className="btn lg ghost">See how it works</a>
          </div>
        </div>

        <div className="hero-card">
          <div className="mock-head"><i /><i /><i /></div>
          <div className="mock-kpis">
            <div><small>Orders</small><b>128</b></div>
            <div><small>Invoiced</small><b>₹18.4L</b></div>
            <div><small>Outstanding</small><b>₹2.1L</b></div>
          </div>
          <div className="mock-bars">
            {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </header>

      <section id="features" className="section">
        <h2>Everything your order cycle needs</h2>
        <p className="sub">Six modules, one connected system.</p>
        <div className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div className="feature" key={title}>
              <div className="icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="section alt">
        <h2>How it works</h2>
        <p className="sub">From customer request to payment received.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step" key={s}>
              <span className="num">{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="section">
        <h2>Built with</h2>
        <div className="stack">
          {STACK.map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      <footer className="home-footer">
        OrderCraft: Mastering Manufacturing Management | FSD Python Project
      </footer>
    </div>
  );
}