import { useState, useEffect } from "react";

const API = "http://localhost:8000";
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Biotechnology", "Mathematics"];
const initialForm = { name: "", roll_number: "", department: "", year: 1, cgpa: 0.0, email: "", phone: "", password: "student123" };

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const C = {
  bg: "#f7f6f2", surface: "#ffffff", surfaceAlt: "#f0efe9",
  border: "#e2e0d8", borderStrong: "#c8c5bb",
  text: "#1c1b18", textMuted: "#6b6860", textFaint: "#a09e98",
  accent: "#1a6b5c", accentLight: "#e8f5f2", accentMid: "#2d9e89", accentText: "#0d4f43",
  danger: "#c0392b", dangerLight: "#fdf0ee",
};

const cgpaColor = (v) => v >= 8.5 ? "#166534" : v >= 7.0 ? "#b45309" : v >= 5.5 ? "#92400e" : "#c0392b";
const cgpaBg = (v) => v >= 8.5 ? "#dcfce7" : v >= 7.0 ? "#fef9c3" : v >= 5.5 ? "#ffedd5" : "#fee2e2";
const avatarColors = [["#1a6b5c","#e8f5f2"],["#4338ca","#eef2ff"],["#b45309","#fef3c7"],["#9333ea","#f5f3ff"],["#0369a1","#e0f2fe"],["#c0392b","#fdf0ee"]];
const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const apiFetch = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) { setError("Please fill in both fields"); return; }
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/login", { method: "POST", body: JSON.stringify({ username, password }) });
      onLogin(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora', Georgia, serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Smart<span style={{ color: C.accent }}>Record</span></div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Sign in to continue</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {error && (
            <div style={{ background: C.dangerLight, border: `1px solid ${C.danger}`, color: C.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>Username / Roll Number</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="admin or CS2021001"
              style={{ width: "100%", padding: "11px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }} />
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? C.borderStrong : C.accent, border: "none", color: "#fff", borderRadius: 8, cursor: loading ? "default" : "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'Lora', serif" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: ${C.accentMid} !important; box-shadow: 0 0 0 3px ${C.accentLight}; }`}</style>
    </div>
  );
}

// ── Student Portal ────────────────────────────────────────────────────────────
function StudentPortal({ user, token, onLogout }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/me", {}, token)
      .then(data => setRecord(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora', serif", color: C.textMuted }}>
      Loading your record...
    </div>
  );

  const [fg, bg] = record ? getAvatarColor(record.name) : ["#1a6b5c", "#e8f5f2"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Lora', Georgia, serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Smart<span style={{ color: C.accent }}>Record</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: C.textMuted }}>Student Portal</span>
          <button onClick={onLogout} style={{ padding: "7px 16px", background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 7, cursor: "pointer", fontSize: 13, fontFamily: "'Lora', serif" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 24px" }}>
        {record && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: fg }}>
                {record.name[0].toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.3px" }}>{record.name}</h1>
                <div style={{ fontSize: 13, color: C.accent, fontFamily: "'DM Mono', monospace" }}>{record.roll_number}</div>
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>
                Academic Details
              </div>
              {[
                ["Department", record.department],
                ["Year", `Year ${record.year}`],
                ["CGPA", record.cgpa],
                ["Email", record.email],
                ["Phone", record.phone || "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.surfaceAlt}` }}>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{label}</span>
                  {label === "CGPA"
                    ? <span style={{ fontSize: 13, fontWeight: 700, color: cgpaColor(val), background: cgpaBg(val), padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>{val}</span>
                    : <span style={{ fontSize: 14, fontWeight: 500 }}>{val}</span>}
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 16px", background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: 10, fontSize: 12, color: C.accentText }}>
              This is a read-only view. Contact your administrator to update your details.
            </div>
          </>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user, token, onLogout }) {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState("dashboard");
  const [form, setForm] = useState(initialForm);
  const [editRoll, setEditRoll] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = () => apiFetch("/students", {}, token).then(d => setStudents(d.students || []));
  const fetchStats = () => apiFetch("/stats", {}, token).then(d => setStats(d));

  useEffect(() => { fetchStudents(); fetchStats(); }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return; }
    apiFetch(`/students/search?q=${encodeURIComponent(debouncedSearch)}`, {}, token)
      .then(d => setSearchResults(d.students || []));
  }, [debouncedSearch]);

  const handleSubmit = async () => {
    if (!form.name || !form.roll_number || !form.department || !form.email) {
      showToast("Please fill all required fields", "error"); return;
    }
    setLoading(true);
    try {
      const url = editRoll ? `/students/${editRoll}` : "/students";
      const method = editRoll ? "PUT" : "POST";
      await apiFetch(url, { method, body: JSON.stringify({ ...form, cgpa: parseFloat(form.cgpa), year: parseInt(form.year) }) }, token);
      showToast(editRoll ? "Student updated!" : "Student added!");
      setForm(initialForm); setEditRoll(null); setView("list");
      fetchStudents(); fetchStats();
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (roll) => {
    try {
      await apiFetch(`/students/${roll}`, { method: "DELETE" }, token);
      showToast("Student removed");
      setDeleteConfirm(null); setSelectedStudent(null);
      fetchStudents(); fetchStats();
    } catch (e) { showToast(e.message, "error"); }
  };

  const startEdit = (s) => {
    setForm({ name: s.name, roll_number: s.roll_number, department: s.department, year: s.year, cgpa: s.cgpa, email: s.email, phone: s.phone || "", password: "" });
    setEditRoll(s.roll_number); setView("add"); setSelectedStudent(null);
  };

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "list", icon: "≡", label: "All Students" },
    { id: "search", icon: "○", label: "Search" },
    { id: "add", icon: "+", label: "Add Student" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Lora', Georgia, serif", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? C.dangerLight : C.accentLight, border: `1px solid ${toast.type === "error" ? C.danger : C.accentMid}`, color: toast.type === "error" ? C.danger : C.accentText, padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", animation: "slideIn 0.2s ease", fontFamily: "'DM Mono', monospace" }}>{toast.msg}</div>
      )}

      {selectedStudent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,24,0.35)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setSelectedStudent(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.1)", position: "relative" }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedStudent(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: C.textFaint, fontSize: 18, cursor: "pointer" }}>✕</button>
            {(() => {
              const [fg, bg] = getAvatarColor(selectedStudent.name);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: fg }}>{selectedStudent.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedStudent.name}</div>
                    <div style={{ color: C.accent, fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{selectedStudent.roll_number}</div>
                  </div>
                </div>
              );
            })()}
            {[["Department", selectedStudent.department], ["Year", `Year ${selectedStudent.year}`], ["CGPA", selectedStudent.cgpa], ["Email", selectedStudent.email], ["Phone", selectedStudent.phone || "—"]].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.surfaceAlt}` }}>
                <span style={{ color: C.textMuted, fontSize: 13 }}>{label}</span>
                {label === "CGPA"
                  ? <span style={{ fontSize: 12, fontWeight: 600, color: cgpaColor(val), background: cgpaBg(val), padding: "2px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>{val}</span>
                  : <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => startEdit(selectedStudent)} style={{ flex: 1, padding: "10px", background: C.accentLight, border: `1px solid ${C.accentMid}`, color: C.accentText, borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Lora', serif" }}>Edit</button>
              <button onClick={() => setDeleteConfirm(selectedStudent.roll_number)} style={{ flex: 1, padding: "10px", background: C.dangerLight, border: `1px solid ${C.danger}`, color: C.danger, borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Lora', serif" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,27,24,0.35)", backdropFilter: "blur(3px)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.danger}`, borderRadius: 14, padding: 32, width: 320, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.dangerLight, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚠</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Remove Student?</div>
            <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 8, cursor: "pointer", fontFamily: "'Lora', serif" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", background: C.danger, border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: "'Lora', serif" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 224, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 10 }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Smart<span style={{ color: C.accent }}>Record</span></div>
          <div style={{ fontSize: 11, color: C.textFaint, marginTop: 3, fontFamily: "'DM Mono', monospace" }}>Admin Dashboard</div>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => { setView(item.id); setEditRoll(null); setForm(initialForm); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, marginBottom: 2, textAlign: "left", background: active ? C.accentLight : "none", border: active ? `1px solid ${C.accentMid}` : "1px solid transparent", color: active ? C.accentText : C.textMuted, fontFamily: "'Lora', serif", transition: "all 0.12s" }}>
                <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 8, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Data Structures</div>
          {[{ label: "Trie", desc: "Autocomplete" }, { label: "HashMap", desc: "O(1) lookup" }, { label: "BST", desc: "Sorted list" }].map(ds => (
            <div key={ds.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: C.accent, fontWeight: 500 }}>{ds.label}</span>
              <span style={{ fontSize: 10, color: C.textFaint }}>{ds.desc}</span>
            </div>
          ))}
          <button onClick={onLogout} style={{ width: "100%", marginTop: 12, padding: "8px", background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "'Lora', serif" }}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 224, flex: 1, padding: "40px 48px" }}>

        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Dashboard</h1>
              <p style={{ color: C.textMuted, fontSize: 14, marginTop: 6 }}>Overview of all student records</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Students", value: stats?.total ?? 0, accent: C.accent },
                { label: "Average CGPA", value: stats?.avg_cgpa ?? "—", accent: "#4338ca" },
                { label: "Departments", value: Object.keys(stats?.departments || {}).length, accent: "#b45309" },
                { label: "Year Groups", value: Object.keys(stats?.year_distribution || {}).length, accent: "#9333ea" },
              ].map(card => (
                <div key={card.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", borderLeft: `3px solid ${card.accent}` }}>
                  <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>{card.label}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, color: card.accent, letterSpacing: "-1px" }}>{card.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 18, fontSize: 14 }}>By Department</div>
                {stats && Object.entries(stats.departments).map(([dept, count]) => (
                  <div key={dept} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: C.textMuted }}>{dept}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: C.accent, fontWeight: 500 }}>{count}</span>
                    </div>
                    <div style={{ height: 3, background: C.surfaceAlt, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${(count / (stats?.total || 1)) * 100}%`, background: C.accentMid, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
                {Object.keys(stats?.departments || {}).length === 0 && <div style={{ color: C.textFaint, fontSize: 13 }}>No records yet</div>}
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 18, fontSize: 14 }}>By Year</div>
                {stats && Object.entries(stats.year_distribution).sort().map(([year, count]) => (
                  <div key={year} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "10px 14px", background: C.surfaceAlt, borderRadius: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accentLight, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: "'DM Mono', monospace" }}>{count}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>Year {year}</div>
                  </div>
                ))}
                {Object.keys(stats?.year_distribution || {}).length === 0 && <div style={{ color: C.textFaint, fontSize: 13 }}>No records yet</div>}
              </div>
            </div>
          </div>
        )}

        {view === "list" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>All Students</h1>
                <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>BST sorted · {students.length} records</p>
              </div>
              <button onClick={() => { setView("add"); setEditRoll(null); setForm(initialForm); }} style={{ padding: "10px 20px", background: C.accent, border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Lora', serif" }}>+ Add Student</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {students.map(s => {
                const [fg, bg] = getAvatarColor(s.name);
                return (
                  <div key={s.roll_number} onClick={() => setSelectedStudent(s)}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentMid; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,107,92,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: fg }}>{s.name[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                        <div style={{ color: C.textFaint, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{s.roll_number}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{s.department.split(" ")[0]} · Y{s.year}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cgpaColor(s.cgpa), background: cgpaBg(s.cgpa), padding: "2px 8px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>{s.cgpa}</span>
                    </div>
                  </div>
                );
              })}
              {students.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.textFaint }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 14 }}>No students yet.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "search" && (
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" }}>Search</h1>
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>Trie-powered autocomplete</p>
            <div style={{ position: "relative", marginBottom: 28 }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.textFaint, fontSize: 16 }}>○</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type a student name..."
                style={{ width: "100%", padding: "13px 16px 13px 42px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }} />
            </div>
            {searchQuery && <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {(searchQuery ? searchResults : students).map(s => {
                const [fg, bg] = getAvatarColor(s.name);
                return (
                  <div key={s.roll_number} onClick={() => setSelectedStudent(s)}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accentMid}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: fg }}>{s.name[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                        <div style={{ color: C.textFaint, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{s.roll_number}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{s.department} · Y{s.year} · <span style={{ color: cgpaColor(s.cgpa), fontWeight: 600 }}>{s.cgpa}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "add" && (
          <div style={{ maxWidth: 520 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" }}>{editRoll ? "Edit Student" : "Add Student"}</h1>
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 32 }}>{editRoll ? `Editing ${editRoll}` : "Enter student details"}</p>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Priya Sharma" },
                { label: "Roll Number *", key: "roll_number", type: "text", placeholder: "e.g. CS2021001", disabled: !!editRoll },
                { label: "Email *", key: "email", type: "email", placeholder: "student@college.edu" },
                { label: "Phone", key: "phone", type: "text", placeholder: "+91 9999999999" },
                { label: editRoll ? "New Password (leave blank to keep)" : "Password *", key: "password", type: "password", placeholder: editRoll ? "Leave blank to keep current" : "student123" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{field.label}</label>
                  <input type={field.type} value={form[field.key]} disabled={field.disabled}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "11px 14px", background: field.disabled ? C.surfaceAlt : C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: field.disabled ? C.textFaint : C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>Department *</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: form.department ? C.text : C.textFaint, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>Year *</label>
                  <select value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                    style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }}>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>CGPA *</label>
                  <input type="number" step="0.1" min="0" max="10" value={form.cgpa}
                    onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Lora', serif" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => { setView("list"); setEditRoll(null); setForm(initialForm); }} style={{ flex: 1, padding: "11px", background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 13, fontFamily: "'Lora', serif" }}>Cancel</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "11px", background: loading ? C.borderStrong : C.accent, border: "none", color: "#fff", borderRadius: 8, cursor: loading ? "default" : "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'Lora', serif" }}>
                  {loading ? "Saving..." : editRoll ? "Update Student" : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus { border-color: ${C.accentMid} !important; box-shadow: 0 0 0 3px ${C.accentLight}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null); // { token, role, name, roll_number? }

  const handleLogin = (data) => setSession(data);
  const handleLogout = () => setSession(null);

  if (!session) return <LoginPage onLogin={handleLogin} />;
  if (session.role === "student") return <StudentPortal user={session} token={session.token} onLogout={handleLogout} />;
  return <AdminDashboard user={session} token={session.token} onLogout={handleLogout} />;
}
