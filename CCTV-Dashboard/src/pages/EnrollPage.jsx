import { useState } from "react";
import Icon, { ICONS } from "../components/Icon";

export default function EnrollPage() {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !roll || !file) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll", roll);
    formData.append("is_authorized", isAuthorized);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/enroll", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        setName("");
        setRoll("");
        setFile(null);
        // Reset file input visually
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
      } else {
        setMessage({ type: "error", text: data.error || "Failed to enroll person." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Is the backend running on port 8000?" });
    }
    setLoading(false);
  };

  return (
    <div className="page-stack">
      <section className="card" style={{ maxWidth: 600, margin: "0 auto", padding: "32px", width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <p className="eyebrow">Database Administration</p>
          <h2 className="card-title">Enroll New Person</h2>
          <p className="card-copy" style={{ marginTop: 8 }}>Add a new authorized or unauthorized person to the facial recognition database. Their face will be immediately recognizable by the camera.</p>
        </div>

        {message && (
          <div className={`badge badge--${message.type === 'success' ? 'authorized' : 'unauthorized'}`} style={{ marginBottom: 24, display: 'block', padding: 12, fontSize: 14 }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#171717" }}>Full Name</span>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #e5e5e5', backgroundColor: '#fafafa', fontSize: 14 }}
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#171717" }}>Roll No / ID</span>
            <input 
              type="text" 
              value={roll} 
              onChange={(e) => setRoll(e.target.value)}
              placeholder="e.g. 21CS001"
              style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #e5e5e5', backgroundColor: '#fafafa', fontSize: 14 }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#171717" }}>Authorization Status</span>
            <select 
              value={isAuthorized} 
              onChange={(e) => setIsAuthorized(e.target.value === 'true')}
              style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #e5e5e5', backgroundColor: '#fafafa', fontSize: 14 }}
            >
              <option value="true">Authorized</option>
              <option value="false">Unauthorized</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#171717" }}>Face Photo</span>
            <input 
              id="file-upload"
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #e5e5e5', backgroundColor: '#fafafa', fontSize: 14 }}
            />
          </label>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: 24, 
              padding: '12px 20px', 
              backgroundColor: '#171717', 
              color: 'white', 
              border: 'none', 
              borderRadius: 6, 
              fontWeight: 500,
              fontSize: 14,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? "Enrolling Face..." : "Enroll Person"}
          </button>
        </form>
      </section>
    </div>
  );
}
