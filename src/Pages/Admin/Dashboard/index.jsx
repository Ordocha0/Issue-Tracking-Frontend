// Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { LoginContext } from "../../../loginContext.jsx";
import styles from "./index.module.css";
import Layout from "../../../Layout/index.jsx";
import { fetchData, fetchUserData } from "../../../Components/titan.js"; 
// ^ adjust the import path to wherever your "Dynamic Base URL Resolver Helper" file lives

// ============================================================
//  CONFIG
// ============================================================
const ASSIGNED_ENDPOINT = "issues/assigned/";
const STATS_ENDPOINT    = "issues/stats/"; // change if your backend differs

const STATUS_COLORS = {
  open:          "#3b82f6",
  "in progress": "#f59e0b",
  resolved:      "#10b981",
  closed:        "#64748b",
};

const PRIORITY_COLORS = {
  low:    "#22c55e",
  medium: "#eab308",
  high:   "#ef4444",
};

// Pretty labels for display
const prettyStatus = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const prettyPriority = (p = "") =>
  p.replace(/\b\w/g, (c) => c.toUpperCase());

// ============================================================
//  COMPONENT
// ============================================================
const Dashboard = () => {
  const loginContext = useContext(LoginContext);
  console.log(loginContext)
  const token = loginContext?.token;

  const [assignedToMe, setAssignedToMe] = useState([]);
  const [stats, setStats] = useState({
    total_issues: 0,
    by_status: [],
    by_priority: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------- Fetch data on mount (and when token changes) --------
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No authentication token found. Please log in again.");
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Assigned issues (uses fetchUserData -> no limit/offset)
        const assigned = await fetchUserData(token, ASSIGNED_ENDPOINT);
        const assignedList = Array.isArray(assigned)
          ? assigned
          : assigned?.results ?? [];

        // 2) Try to fetch aggregated stats. Fall back to derived stats if unavailable.
        let statsPayload = null;
        try {
          statsPayload = await fetchUserData(token, STATS_ENDPOINT);
        } catch (statsErr) {
          console.warn(
            `Stats endpoint "${STATS_ENDPOINT}" unavailable — deriving stats locally.`,
            statsErr
          );
        }

        if (cancelled) return;

        // ---- If stats endpoint worked, use it; otherwise compute from assigned ----
        const derived = deriveStats(assignedList);
        const finalStats = statsPayload
          ? normalizeStats(statsPayload)
          : derived;

        setAssignedToMe(assignedList);
        setStats(finalStats);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, [token]);

  // -------- Derived chart data --------
  const statusData = (stats.by_status || []).map((s) => ({
    name: prettyStatus(s.status),
    rawName: s.status,
    value: Number(s.count) || 0,
  }));

  const priorityData = (stats.by_priority || []).map((p) => ({
    name: prettyPriority(p.priority),
    rawName: p.priority,
    value: Number(p.count) || 0,
  }));

  const totalIssues   = stats.total_issues ?? assignedToMe.length;
  const openCount     = statusData.find((s) => s.rawName === "open")?.value ?? 0;
  const inProgressCount =
    statusData.find((s) => s.rawName === "in_progress" ||
                          s.rawName === "in progress")?.value ?? 0;

  // -------- Render --------
  return (
    <Layout className={styles.dashboard}>
      {/* ---------- Header ---------- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Welcome back, {loginContext?.userName || "User"} 👋
          </h1>
          <p className={styles.subtitle}>
            Here's what's happening with your issues today.
          </p>
        </div>
        <button
          className={styles.newIssueBtn}
          onClick={() => (window.location.href = "/issues/new")}
        >
          + New Issue
        </button>
      </div>

      {/* ---------- Loading / Error ---------- */}
      {loading && (
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <p>Loading dashboard…</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <p style={{ color: "#ef4444" }}>⚠️ {error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ---------- KPI Cards ---------- */}
          <div className={styles.kpiGrid}>
            <KpiCard label="Total Issues"    value={totalIssues}            tone="blue"   />
            <KpiCard label="Open"            value={openCount}              tone="blue"   />
            <KpiCard label="In Progress"     value={inProgressCount}        tone="amber"  />
            <KpiCard label="Assigned to Me"  value={assignedToMe.length}    tone="purple" />
          </div>

          {/* ---------- Charts ---------- */}
          <div className={styles.chartGrid}>
            {/* Status chart */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Issues by Status</h3>
              </div>
              <div className={styles.cardBody}>
                {statusData.length === 0 ? (
                  <p>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.rawName}
                            fill={STATUS_COLORS[entry.rawName] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Priority chart */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Issues by Priority</h3>
              </div>
              <div className={styles.cardBody}>
                {priorityData.length === 0 ? (
                  <p>No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={priorityData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {priorityData.map((entry) => (
                          <Cell
                            key={entry.rawName}
                            fill={PRIORITY_COLORS[entry.rawName] || "#94a3b8"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Assigned to Me ---------- */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                Assigned to You ({assignedToMe.length})
              </h3>
            </div>
            <div className={styles.cardBody}>
              {assignedToMe.length === 0 ? (
                <p>Nothing assigned to you right now. 🎉</p>
              ) : (
                <ul className={styles.issueList}>
                  {assignedToMe.map((issue) => (
                    <li key={issue.id} className={styles.issueItem}>
                      <div className={styles.issueInfo}>
                        <a
                          href={`/issues/${issue.id}`}
                          className={styles.issueTitle}
                        >
                          #{shortId(issue.id)} · {issue.title}
                        </a>
                        {issue.created_at && (
                          <span className={styles.issueDate}>
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className={styles.issueBadges}>
                        <span
                          className={`${styles.badge} ${
                            styles["priority-" + (issue.priority || "").toLowerCase()]
                          }`}
                        >
                          {prettyPriority(issue.priority)}
                        </span>
                        <span
                          className={`${styles.badge} ${
                            styles[
                              "status-" +
                                (issue.status || "").replace(/_/g, "-").toLowerCase()
                            ]
                          }`}
                        >
                          {prettyStatus(issue.status)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

/* ---------- Small reusable KPI card ---------- */
const KpiCard = ({ label, value, tone }) => (
  <div className={styles.kpiCard}>
    <p className={styles.kpiLabel}>{label}</p>
    <p className={`${styles.kpiValue} ${styles["kpi-" + tone]}`}>{value}</p>
  </div>
);

/* ---------- Helpers ---------- */

// Show a short ID (UUIDs are long)
const shortId = (id) =>
  typeof id === "string" && id.length > 8 ? `${id.slice(0, 8)}…` : id;

// Compute stats from a list of issues (fallback when stats endpoint is missing)
const deriveStats = (issues) => {
  const byStatus = {};
  const byPriority = {};

  issues.forEach((i) => {
    const s = (i.status || "unknown").toLowerCase();
    const p = (i.priority || "unknown").toLowerCase();
    byStatus[s] = (byStatus[s] || 0) + 1;
    byPriority[p] = (byPriority[p] || 0) + 1;
  });

  return {
    total_issues: issues.length,
    by_status: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    by_priority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
  };
};

// Normalize whatever shape the stats endpoint returns
const normalizeStats = (raw) => {
  if (!raw || typeof raw !== "object") return deriveStats([]);

  return {
    total_issues: raw.total_issues ?? raw.total ?? 0,
    by_status: Array.isArray(raw.by_status) ? raw.by_status : [],
    by_priority: Array.isArray(raw.by_priority) ? raw.by_priority : [],
  };
};

export default Dashboard;