import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Factory } from "lucide-react";
import { FEATURES } from "../data/features";

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = FEATURES.find((f) => f.slug === slug);
  if (!feature) return <Navigate to="/" replace />;

  const index = FEATURES.indexOf(feature);
  const next = FEATURES[(index + 1) % FEATURES.length];

  return (
    <div className="home">
      <nav className="home-nav">
        <Link to="/" className="brand"><Factory size={22} /> OrderCraft</Link>
        <div className="nav-links">
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link>
          <Link to="/login" className="btn">Login</Link>
        </div>
      </nav>

      <div className="detail">
        <span className="pill">Feature {index + 1} of {FEATURES.length}</span>
        <h1>{feature.title}</h1>
        <p className="lead">{feature.overview}</p>

        <h3>Key points</h3>
        <ul className="checks">
          {feature.points.map((p) => (
            <li key={p}><CheckCircle2 size={18} /> {p}</li>
          ))}
        </ul>

        <div className="tech-box"><b>Technical:</b> {feature.tech}</div>

        <div className="detail-actions">
          <Link to="/login" className="btn lg">Try it: Login</Link>
          <Link to={`/features/${next.slug}`} className="btn lg ghost">Next: {next.title}</Link>
        </div>
      </div>
    </div>
  );
}