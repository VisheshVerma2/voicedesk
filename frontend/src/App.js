import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

// ── Icons (inline SVG) ─────────────────────────────────────────────────
const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  transcript: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ── Stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ "--accent": color }}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    confirmed: "badge-green",
    completed: "badge-blue",
    cancelled: "badge-red",
    "no-show": "badge-gray",
    "in-progress": "badge-yellow",
    pending: "badge-yellow",
    unknown: "badge-gray",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
}

// ── Bookings tab ───────────────────────────────────────────────────────
function BookingsTab({ bookings, loading, onStatusChange }) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Appointments</h2>
        <div className="filter-row">
          {["all", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No appointments found.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="patient-cell">
                      <span className="patient-name">{b.name}</span>
                      {b.phone && <span className="patient-phone">{b.phone}</span>}
                    </div>
                  </td>
                  <td>{dayjs(b.date).format("DD MMM YYYY")}</td>
                  <td>{b.time}</td>
                  <td>{b.reason}</td>
                  <td>
                    <Badge status={b.status} />
                  </td>
                  <td>
                    <div className="action-row">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            className="action-btn green"
                            title="Mark completed"
                            onClick={() => onStatusChange(b.id, "completed")}
                          >
                            {Icon.check}
                          </button>
                          <button
                            className="action-btn red"
                            title="Cancel"
                            onClick={() => onStatusChange(b.id, "cancelled")}
                          >
                            {Icon.x}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Call logs tab ──────────────────────────────────────────────────────
function CallsTab({ calls, loading }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Call Logs</h2>
      </div>

      {loading ? (
        <div className="loading">Loading calls…</div>
      ) : calls.length === 0 ? (
        <div className="empty">No calls yet. Once your Vapi agent is live, calls will appear here.</div>
      ) : (
        <div className="calls-layout">
          <div className="calls-list">
            {calls.map((c) => (
              <div
                key={c.id}
                className={`call-row ${selected?.id === c.id ? "selected" : ""}`}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
              >
                <div className="call-row-top">
                  <span className="call-phone">{c.phoneNumber}</span>
                  <Badge status={c.intent || c.status} />
                </div>
                <div className="call-row-bot">
                  <span>{dayjs(c.createdAt).format("DD MMM, h:mm A")}</span>
                  {c.duration > 0 && (
                    <span>{Math.floor(c.duration / 60)}m {c.duration % 60}s</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="transcript-panel">
              <div className="transcript-header">
                <span>Transcript — {selected.phoneNumber}</span>
                <button className="close-btn" onClick={() => setSelected(null)}>
                  {Icon.x}
                </button>
              </div>

              {selected.summary && (
                <div className="summary-box">
                  <strong>Summary:</strong> {selected.summary}
                </div>
              )}

              <div className="transcript-body">
                {Array.isArray(selected.transcript) && selected.transcript.length > 0 ? (
                  selected.transcript.map((line, i) => (
                    <div
                      key={i}
                      className={`transcript-line ${
                        line.role === "assistant" ? "line-assistant" : "line-user"
                      }`}
                    >
                      <span className="line-role">
                        {line.role === "assistant" ? "Priya" : "Patient"}
                      </span>
                      <span className="line-text">{line.content || line.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty">No transcript available.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Handoffs tab ───────────────────────────────────────────────────────
function HandoffsTab({ handoffs, loading }) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Callback Queue</h2>
        <span className="subtitle">Patients who need a human follow-up</span>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : handoffs.length === 0 ? (
        <div className="empty">No pending callbacks. Great job! 🎉</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Question / Issue</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {handoffs.map((h) => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td>{h.phoneNumber}</td>
                  <td className="question-cell">{h.question}</td>
                  <td>{dayjs(h.createdAt).format("DD MMM, h:mm A")}</td>
                  <td>
                    <Badge status={h.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Overview / analytics tab ───────────────────────────────────────────
function OverviewTab({ bookings, calls, handoffs }) {
  const today = dayjs().format("YYYY-MM-DD");
  const todayBookings = bookings.filter((b) => b.date === today);
  const confirmedToday = todayBookings.filter((b) => b.status === "confirmed").length;
  const totalCalls = calls.length;
  const pendingHandoffs = handoffs.filter((h) => h.status === "pending").length;

  // Build last 7 days chart data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, "day");
    const dateStr = d.format("YYYY-MM-DD");
    chartData.push({
      date: d.format("DD MMM"),
      bookings: bookings.filter((b) => b.date === dateStr).length,
      calls: calls.filter((c) => c.createdAt?.startsWith(dateStr)).length,
    });
  }

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Overview</h2>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Today's Appointments"
          value={confirmedToday}
          sub={`${todayBookings.length} total today`}
          color="#3b82f6"
        />
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          sub="all time"
          color="#10b981"
        />
        <StatCard
          label="Total Calls"
          value={totalCalls}
          sub="handled by Priya"
          color="#8b5cf6"
        />
        <StatCard
          label="Callback Queue"
          value={pendingHandoffs}
          sub={pendingHandoffs > 0 ? "need follow-up" : "all clear ✓"}
          color={pendingHandoffs > 0 ? "#f59e0b" : "#10b981"}
        />
      </div>

      <div className="chart-card">
        <h3>Last 7 Days Activity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#f1f5f9" }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="calls" name="Calls" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {bookings.filter((b) => b.date === today).length > 0 && (
        <div className="chart-card">
          <h3>Today's Schedule</h3>
          <div className="schedule-list">
            {bookings
              .filter((b) => b.date === today)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((b) => (
                <div key={b.id} className="schedule-row">
                  <span className="sched-time">{b.time}</span>
                  <span className="sched-name">{b.name}</span>
                  <span className="sched-reason">{b.reason}</span>
                  <Badge status={b.status} />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [calls, setCalls] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState({ bookings: true, calls: true, handoffs: true });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [bRes, cRes, hRes] = await Promise.allSettled([
        axios.get(`${API}/api/bookings`),
        axios.get(`${API}/api/calls`),
        axios.get(`${API}/api/calls/handoffs`),
      ]);

      if (bRes.status === "fulfilled") {
        setBookings(bRes.value.data.bookings || []);
        setLoading((l) => ({ ...l, bookings: false }));
      }
      if (cRes.status === "fulfilled") {
        setCalls(cRes.value.data.calls || []);
        setLoading((l) => ({ ...l, calls: false }));
      }
      if (hRes.status === "fulfilled") {
        setHandoffs(hRes.value.data.handoffs || []);
        setLoading((l) => ({ ...l, handoffs: false }));
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`${API}/api/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      alert("Failed to update status. Check backend connection.");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Icon.calendar },
    { id: "bookings", label: "Appointments", icon: Icon.calendar, count: bookings.filter((b) => b.status === "confirmed" && b.date >= dayjs().format("YYYY-MM-DD")).length },
    { id: "calls", label: "Call Logs", icon: Icon.phone, count: calls.length },
    { id: "handoffs", label: "Callbacks", icon: Icon.alert, count: handoffs.filter((h) => h.status === "pending").length, urgent: true },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">{Icon.phone}</div>
          <div className="brand-text">
            <span className="brand-name">VoiceDesk</span>
            <span className="brand-sub">MediCare Clinic</span>
          </div>
        </div>

        <nav className="nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
              {t.count > 0 && (
                <span className={`nav-badge ${t.urgent && t.count > 0 ? "urgent" : ""}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="agent-status">
            <span className="status-dot" />
            <span>Priya is live</span>
          </div>
          {lastUpdated && (
            <span className="last-updated">
              Updated {dayjs(lastUpdated).format("h:mm A")}
            </span>
          )}
          <button className="refresh-btn" onClick={fetchAll}>
            Refresh
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {tab === "overview" && (
          <OverviewTab bookings={bookings} calls={calls} handoffs={handoffs} />
        )}
        {tab === "bookings" && (
          <BookingsTab
            bookings={bookings}
            loading={loading.bookings}
            onStatusChange={handleStatusChange}
          />
        )}
        {tab === "calls" && <CallsTab calls={calls} loading={loading.calls} />}
        {tab === "handoffs" && <HandoffsTab handoffs={handoffs} loading={loading.handoffs} />}
      </main>
    </div>
  );
}
