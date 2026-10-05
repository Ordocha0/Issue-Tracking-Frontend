// Staff.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import {
  MdSearch,
  MdPersonAdd,
  MdClose,
  MdEmail,
  MdPhone,
  MdBadge,
  MdCheckCircle,
  MdBlock,
  MdEdit,
  MdWorkOutline,
} from "react-icons/md";
import { LoginContext } from "../../../loginContext";
import { PosthData } from "../../../Components/titan.js";
import styles from "./index.module.css";
import Layout from "../../../Layout/index.jsx";

// ============================================================
//  HARDCODED STAFF (replace with API later)
// ============================================================
const HARDCODED_STAFF = [
  {
    id: "576078fb-3749-4540-bed9-bb8cb0c3d22b",
    first_name: "Alice",
    last_name: "Wanjiru",
    username: "alice.w",
    email: "alice.wanjiru@craygroup.co.ke",
    phone: "+254 712 345 678",
    role: "admin",
    department: "Engineering",
    job_title: "Lead Engineer",
    status: "active",
    national_id: "12345678",
    profile_pic: null,
    joined_at: "2023-04-12T09:00:00Z",
    open_issues: 4,
    resolved_issues: 87,
  },
  {
    id: "a1b2c3d4-1111-2222-3333-444455556666",
    first_name: "Brian",
    last_name: "Otieno",
    username: "brian.o",
    email: "brian.otieno@craygroup.co.ke",
    phone: "+254 723 456 789",
    role: "user",
    department: "Engineering",
    job_title: "Frontend Developer",
    status: "active",
    national_id: "23456789",
    profile_pic: null,
    joined_at: "2024-01-22T09:00:00Z",
    open_issues: 6,
    resolved_issues: 42,
  },
  {
    id: "b2c3d4e5-2222-3333-4444-555566667777",
    first_name: "Cynthia",
    last_name: "Mwangi",
    username: "cynthia.m",
    email: "cynthia.mwangi@craygroup.co.ke",
    phone: "+254 734 567 890",
    role: "user",
    department: "Support",
    job_title: "Support Specialist",
    status: "active",
    national_id: "34567890",
    profile_pic: null,
    joined_at: "2023-09-05T09:00:00Z",
    open_issues: 3,
    resolved_issues: 128,
  },
  {
    id: "c3d4e5f6-3333-4444-5555-666677778888",
    first_name: "David",
    last_name: "Kimani",
    username: "david.k",
    email: "david.kimani@craygroup.co.ke",
    phone: "+254 745 678 901",
    role: "user",
    department: "Engineering",
    job_title: "Backend Developer",
    status: "active",
    national_id: "45678901",
    profile_pic: null,
    joined_at: "2024-03-18T09:00:00Z",
    open_issues: 5,
    resolved_issues: 31,
  },
  {
    id: "d4e5f6a7-4444-5555-6666-777788889999",
    first_name: "Esther",
    last_name: "Njeri",
    username: "esther.n",
    email: "esther.njeri@craygroup.co.ke",
    phone: "+254 756 789 012",
    role: "admin",
    department: "Operations",
    job_title: "Operations Manager",
    status: "active",
    national_id: "56789012",
    profile_pic: null,
    joined_at: "2022-11-30T09:00:00Z",
    open_issues: 2,
    resolved_issues: 210,
  },
  {
    id: "e5f6a7b8-5555-6666-7777-888899990000",
    first_name: "Felix",
    last_name: "Otieno",
    username: "felix.o",
    email: "felix.otieno@craygroup.co.ke",
    phone: "+254 767 890 123",
    role: "user",
    department: "Network",
    job_title: "Network Engineer",
    status: "suspended",
    national_id: "67890123",
    profile_pic: null,
    joined_at: "2023-06-14T09:00:00Z",
    open_issues: 0,
    resolved_issues: 19,
  },
];

const ROLES = ["admin", "user"];
const STATUSES = ["active", "suspended"];
const DEPARTMENTS = ["Engineering", "Support", "Operations", "Network"];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const initialsOf = (first, last) =>
  `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase();

const hueOf = (str) =>
  [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

const fullName = (s) =>
  `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ============================================================
//  Main page
// ============================================================
const Staff = () => {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const isAdmin = loginContext?.role === "admin";

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    department: "",
  });

  const [selected, setSelected] = useState(null);

  // ---------- Load ----------
  useEffect(() => {
    setLoading(true);
    try {
      // Swap for: const data = await PosthData(null, "accounts/users/", null)
      setStaff(HARDCODED_STAFF);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Filtering ----------
  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const q = filters.search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fullName(s).toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.job_title?.toLowerCase().includes(q);

      const matchesRole = !filters.role || s.role === filters.role;
      const matchesStatus = !filters.status || s.status === filters.status;
      const matchesDept =
        !filters.department || s.department === filters.department;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [staff, filters]);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const clearFilters = () =>
    setFilters({ search: "", role: "", status: "", department: "" });

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  // ---------- Counts (for mini KPIs) ----------
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "active").length;
  const adminCount = staff.filter((s) => s.role === "admin").length;
  const openIssuesTotal = staff.reduce(
    (sum, s) => sum + (s.open_issues || 0),
    0
  );

  // ---------- Render ----------
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingBox}>
          <ClipLoader color="#0f172a" size={28} />
          <p>Loading staff…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout className={styles.page}>
      {/* ---------- Header ---------- */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Staff</h1>
          <p className={styles.subtitle}>
            {filtered.length} of {totalStaff} team member
            {totalStaff !== 1 ? "s" : ""}
          </p>
        </div>

        {isAdmin && (
          <button className={styles.newBtn} onClick={() => navigate("/staff/new")}>
            <MdPersonAdd size={18} />
            Add Staff
          </button>
        )}
      </div>

      {/* ---------- KPI row ---------- */}
      <div className={styles.kpiGrid}>
        <KpiCard label="Total Staff" value={totalStaff} tone="blue" />
        <KpiCard label="Active" value={activeStaff} tone="green" />
        <KpiCard label="Admins" value={adminCount} tone="purple" />
        <KpiCard label="Open Issues Assigned" value={openIssuesTotal} tone="amber" />
      </div>

      {/* ---------- Filters ---------- */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <MdSearch size={18} className={styles.searchIcon} />
          <input
            type="text"
            name="search"
            placeholder="Search by name, email, username…"
            value={filters.search}
            onChange={handleFilterChange}
            className={styles.searchInput}
          />
        </div>

        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {/* ---------- Table ---------- */}
      {filtered.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyTitle}>No staff found</p>
          <p className={styles.emptySubtitle}>
            {hasActiveFilters
              ? "Try adjusting your filters or search term."
              : "Add your first team member to get started."}
          </p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <div className={styles.colName}>Name</div>
            <div className={styles.colContact}>Contact</div>
            <div className={styles.colDept}>Department</div>
            <div className={styles.colRole}>Role</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colIssues}>Issues</div>
            <div className={styles.colActions}></div>
          </div>

          {filtered.map((person) => {
            const hue = hueOf(fullName(person));
            return (
              <div
                key={person.id}
                className={`${styles.tableRow} ${styles.tableBodyRow}`}
                onClick={() => setSelected(person)}
              >
                <div className={styles.colName}>
                  <div
                    className={styles.avatar}
                    style={{
                      background: `hsl(${hue}, 65%, 92%)`,
                      color: `hsl(${hue}, 55%, 35%)`,
                    }}
                  >
                    {initialsOf(person.first_name, person.last_name)}
                  </div>
                  <div className={styles.nameBlock}>
                    <span className={styles.nameText}>{fullName(person)}</span>
                    <span className={styles.usernameText}>
                      @{person.username}
                    </span>
                  </div>
                </div>

                <div className={styles.colContact}>
                  <span className={styles.contactText}>{person.email}</span>
                  <span className={styles.contactSub}>{person.phone}</span>
                </div>

                <div className={styles.colDept}>
                  <span className={styles.deptText}>{person.department}</span>
                  <span className={styles.contactSub}>{person.job_title}</span>
                </div>

                <div className={styles.colRole}>
                  <span
                    className={`${styles.badge} ${
                      person.role === "admin"
                        ? styles.badgeAdmin
                        : styles.badgeUser
                    }`}
                  >
                    {person.role}
                  </span>
                </div>

                <div className={styles.colStatus}>
                  <span
                    className={`${styles.badge} ${
                      person.status === "active"
                        ? styles.badgeActive
                        : styles.badgeSuspended
                    }`}
                  >
                    <span className={styles.dot} />
                    {person.status}
                  </span>
                </div>

                <div className={styles.colIssues}>
                  <span className={styles.issueCount}>
                    <strong>{person.open_issues}</strong> open
                  </span>
                  <span className={styles.contactSub}>
                    {person.resolved_issues} resolved
                  </span>
                </div>

                <div className={styles.colActions}>
                  <button
                    className={styles.rowAction}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(person);
                    }}
                    aria-label="View details"
                  >
                    <MdEdit size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Slide-in detail panel ---------- */}
      {selected && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <aside className={styles.panel} role="dialog" aria-label="Staff details">
            <button
              className={styles.closeBtn}
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <MdClose size={20} />
            </button>

            {/* Header */}
            <div className={styles.panelHeader}>
              <div
                className={styles.panelAvatar}
                style={{
                  background: `hsl(${hueOf(fullName(selected))}, 65%, 92%)`,
                  color: `hsl(${hueOf(fullName(selected))}, 55%, 35%)`,
                }}
              >
                {initialsOf(selected.first_name, selected.last_name)}
              </div>
              <h2 className={styles.panelName}>{fullName(selected)}</h2>
              <p className={styles.panelUsername}>@{selected.username}</p>

              <div className={styles.panelBadges}>
                <span
                  className={`${styles.badge} ${
                    selected.role === "admin"
                      ? styles.badgeAdmin
                      : styles.badgeUser
                  }`}
                >
                  {selected.role}
                </span>
                <span
                  className={`${styles.badge} ${
                    selected.status === "active"
                      ? styles.badgeActive
                      : styles.badgeSuspended
                  }`}
                >
                  <span className={styles.dot} />
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Contact</h3>
              <DetailRow icon={<MdEmail size={16} />} label="Email" value={selected.email} />
              <DetailRow icon={<MdPhone size={16} />} label="Phone" value={selected.phone} />
            </div>

            <div className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Work</h3>
              <DetailRow
                icon={<MdWorkOutline size={16} />}
                label="Job Title"
                value={selected.job_title}
              />
              <DetailRow label="Department" value={selected.department} />
              <DetailRow
                label="Joined"
                value={formatDate(selected.joined_at)}
              />
            </div>

            <div className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Identity</h3>
              <DetailRow
                icon={<MdBadge size={16} />}
                label="National ID"
                value={selected.national_id}
              />
              <DetailRow
                label="User ID"
                value={String(selected.id).slice(0, 14) + "…"}
              />
            </div>

            <div className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>Issues</h3>
              <div className={styles.issueStats}>
                <div className={styles.issueStat}>
                  <span className={styles.issueStatNum}>
                    {selected.open_issues}
                  </span>
                  <span className={styles.issueStatLabel}>Open</span>
                </div>
                <div className={styles.issueStat}>
                  <span className={styles.issueStatNum}>
                    {selected.resolved_issues}
                  </span>
                  <span className={styles.issueStatLabel}>Resolved</span>
                </div>
              </div>
              <button
                className={styles.viewIssuesBtn}
                onClick={() => navigate(`/issues?assigned_to=${selected.id}`)}
              >
                View assigned issues →
              </button>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className={styles.panelActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => navigate(`/staff/${selected.id}/edit`)}
                >
                  <MdEdit size={16} /> Edit
                </button>
                <button
                  className={`${styles.secondaryBtn} ${
                    selected.status === "active"
                      ? styles.dangerBtn
                      : styles.successBtn
                  }`}
                >
                  {selected.status === "active" ? (
                    <>
                      <MdBlock size={16} /> Suspend
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={16} /> Reactivate
                    </>
                  )}
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </Layout>
  );
};

// ------------------------------------------------------------
// Small components
// ------------------------------------------------------------
const KpiCard = ({ label, value, tone }) => (
  <div className={styles.kpiCard}>
    <p className={styles.kpiLabel}>{label}</p>
    <p className={`${styles.kpiValue} ${styles["kpi-" + tone]}`}>{value}</p>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className={styles.detailRow}>
    <span className={styles.detailLabel}>
      {icon}
      {label}
    </span>
    <span className={styles.detailValue} title={value}>
      {value || "—"}
    </span>
  </div>
);

export default Staff;