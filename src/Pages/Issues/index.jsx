// Issues.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { LoginContext } from "../../loginContext";
import { fetchData, fetchUserData } from "../../Components/titan.js";
import styles from "./index.module.css";
import Layout from "../../Layout/index.jsx";

// ============================================================
//  STAFF LOOKUP
//  Ideally this should come from the backend (/users/), but for
//  now we resolve names locally and fall back to short UUIDs.
// ============================================================
const STAFF = [
  { id: "576078fb-3749-4540-bed9-bb8cb0c3d22b", name: "Alice Wanjiru", role: "admin" },
  { id: "a1b2c3d4-1111-2222-3333-444455556666", name: "Brian Otieno",   role: "user"  },
  { id: "b2c3d4e5-2222-3333-4444-555566667777", name: "Cynthia Mwangi", role: "user"  },
  { id: "c3d4e5f6-3333-4444-5555-666677778888", name: "David Kimani",   role: "user"  },
  { id: "d4e5f6a7-4444-5555-6666-777788889999", name: "Esther Njeri",   role: "admin" },
];

// ============================================================
//  CANONICAL VALUES
//  Everything in the UI works with Title Case + spaced statuses.
//  Convert to/from the backend at the boundary.
// ============================================================
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES   = ["Open", "In Progress", "Resolved", "Closed"];

// ---- Normalizers (backend -> UI) ----
const toTitleCase = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeStatus   = (s) => toTitleCase((s || "open").toLowerCase());
const normalizePriority = (p) => toTitleCase((p || "low").toLowerCase());

// ---- Serializers (UI -> backend), used for filters/query strings later ----
const toApiStatus   = (s) => s.toLowerCase().replace(/\s+/g, "_");
const toApiPriority = (p) => p.toLowerCase();

// ---- Display helpers ----
const shortId = (id) =>
  typeof id === "string" && id.length > 8 ? id.slice(0, 8) + "…" : id;

const staffName = (id) => STAFF.find((s) => s.id === id)?.name || null;

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// ============================================================
//  ISSUES COMPONENT
// ============================================================
const Issues = () => {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const token = loginContext?.token;

  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // ---------- Filters ----------
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assigned_to: "",
  });

  // ==========================================================
  //  FETCH ISSUES FROM BACKEND
  //  Endpoint: GET /issues/assigned/
  //  Uses fetchUserData (no limit/offset appended) because
  //  /assigned/ is a purpose-built endpoint. If your backend
  //  later returns a paginated {count, results} envelope, we
  //  unwrap it below.
  // ==========================================================
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Not authenticated. Please log in again.");
      return;
    }

    let cancelled = false;

    const loadIssues = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchUserData(token, "issues/assigned/");
        const list = Array.isArray(data) ? data : data?.results ?? [];

        // ---- Normalize each issue for the UI ----
        const normalized = list.map((raw) => ({
          id:          raw.id,
          title:       raw.title ?? "(untitled)",
          description: raw.description ?? "",
          status:      normalizeStatus(raw.status),
          priority:    normalizePriority(raw.priority),
          created_by:  raw.created_by  ?? null,
          assigned_to: raw.assigned_to ?? null,
          created_at:  raw.created_at  ?? null,   // backend doesn't return this yet
        }));

        if (!cancelled) setIssues(normalized);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load issues.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadIssues();
    return () => { cancelled = true; };
  }, [token]);

  // ==========================================================
  //  CLIENT-SIDE FILTERING
  //  (Server-side filtering can be layered on later by adding
  //   query params to the fetch call.)
  // ==========================================================
  const filteredIssues = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q);

      const matchesStatus   = !filters.status   || issue.status   === filters.status;
      const matchesPriority = !filters.priority || issue.priority === filters.priority;

      const matchesAssigned =
        !filters.assigned_to ||
        (filters.assigned_to === "unassigned"
          ? !issue.assigned_to
          : issue.assigned_to === filters.assigned_to);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssigned;
    });
  }, [issues, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () =>
    setFilters({ search: "", status: "", priority: "", assigned_to: "" });

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  // ==========================================================
  //  RENDER
  // ==========================================================
  return (
    <Layout className={styles.page}>
      {/* ---------- Header ---------- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Issues</h1>
          <p className={styles.subtitle}>
            {filteredIssues.length} of {issues.length} issue
            {issues.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className={styles.newIssueBtn}
          onClick={() => navigate("/issues/new")}
        >
          + New Issue
        </button>
      </div>

      {/* ---------- Filter Bar ---------- */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            name="search"
            placeholder="Search issues…"
            value={filters.search}
            onChange={handleFilterChange}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            name="assigned_to"
            value={filters.assigned_to}
            onChange={handleFilterChange}
          >
            <option value="">All Assignees</option>
            <option value="unassigned">— Unassigned —</option>
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* ---------- Content ---------- */}
      {loading && (
        <div className={styles.loadingBox}>
          <ClipLoader color="#0f172a" size={28} />
          <p>Loading issues…</p>
        </div>
      )}

      {error && !loading && (
        <div className={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredIssues.length === 0 && (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>No issues found</p>
          <p className={styles.emptySubtitle}>
            {hasActiveFilters
              ? "Try adjusting your filters or search term."
              : "Nothing has been assigned to you yet."}
          </p>
          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredIssues.length > 0 && (
        <div className={styles.table}>
          {/* Head */}
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <div className={styles.colId}>ID</div>
            <div className={styles.colTitle}>Title</div>
            <div className={styles.colPriority}>Priority</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colAssigned}>Assigned To</div>
            <div className={styles.colDate}>Created</div>
          </div>

          {/* Rows */}
          {filteredIssues.map((issue) => {
            const assigneeName = issue.assigned_to
              ? staffName(issue.assigned_to) || shortId(issue.assigned_to)
              : null;
            const avatarText = assigneeName
              ? initialsOf(staffName(issue.assigned_to) || "?")
              : null;

            return (
              <div
                key={issue.id}
                className={`${styles.tableRow} ${styles.tableBodyRow}`}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div className={styles.colId}>#{shortId(issue.id)}</div>

                <div className={styles.colTitle}>
                  <span className={styles.issueTitle}>{issue.title}</span>
                  <span className={styles.issueDesc}>{issue.description}</span>
                </div>

                <div className={styles.colPriority}>
                  <span
                    className={`${styles.badge} ${
                      styles["priority-" + issue.priority.toLowerCase()]
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>

                <div className={styles.colStatus}>
                  <span
                    className={`${styles.badge} ${
                      styles[
                        "status-" + issue.status.replace(/\s+/g, "-").toLowerCase()
                      ]
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>

                <div className={styles.colAssigned}>
                  {assigneeName ? (
                    <span className={styles.assignee}>
                      <span className={styles.avatar}>{avatarText}</span>
                      {assigneeName}
                    </span>
                  ) : (
                    <span className={styles.unassigned}>Unassigned</span>
                  )}
                </div>

                <div className={styles.colDate}>
                  {issue.created_at
                    ? new Date(issue.created_at).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Issues;