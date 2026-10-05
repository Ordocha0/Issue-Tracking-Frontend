// NewIssue.jsx
import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { LoginContext } from "../../loginContext.jsx";
import { PosthData, fetchUserData } from "../../Components/titan.js";
import styles from "./index.module.css";
import Layout from "../../Layout/index.jsx";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES   = ["Open", "In Progress", "Resolved", "Closed"];

const toApiStatus   = (s) => s.toLowerCase().replace(/\s+/g, "_");
const toApiPriority = (p) => p.toLowerCase();

const NewIssue = () => {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const token = loginContext?.token;

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [staff, setStaff]               = useState([]);
  const [staffSearch, setStaffSearch]   = useState("");
  const [staffLoading, setStaffLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    assigned_to: "",
  });

  // ---------------- Load users from /user/all/ ----------------
  useEffect(() => {
    if (!token) { setStaffLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchUserData(token, "user/all/");
        const list = Array.isArray(data)
          ? data
          : data?.results ?? data?.users ?? [];
        if (cancelled) return;

        setStaff(
          list
            .filter((u) => !u.deleted_at)
            .map((u) => ({
              id:   u.id,
              name:
                [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
                u.username || u.name || u.email || "Unknown",
              role:  u.role ?? u.user_role ?? "user",
              email: u.email ?? "",
            }))
        );
      } catch (err) {
        console.warn("Failed to load /user/all/, using fallback:", err);
        if (!cancelled) {
          setStaff([
            { id: "576078fb-3749-4540-bed9-bb8cb0c3d22b", name: "Alice Wanjiru",  role: "admin", email: "" },
            { id: "a1b2c3d4-1111-2222-3333-444455556666", name: "Brian Otieno",    role: "user",  email: "" },
            { id: "b2c3d4e5-2222-3333-4444-555566667777", name: "Cynthia Mwangi",  role: "user",  email: "" },
            { id: "c3d4e5f6-3333-4444-5555-666677778888", name: "David Kimani",    role: "user",  email: "" },
            { id: "d4e5f6a7-4444-5555-6666-777788889999", name: "Esther Njeri",    role: "admin", email: "" },
          ]);
        }
      } finally {
        if (!cancelled) setStaffLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
    );
  }, [staff, staffSearch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required.");
    if (!token) return setError("You are not logged in.");

    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        status:      toApiStatus(form.status),
        priority:    toApiPriority(form.priority),
        assigned_to: form.assigned_to || null,
      };
      const created = await PosthData(token, "issues/create", payload);
      navigate(created?.id ? `/issues/${created.id}` : "/issues");
    } catch (err) {
      setError(err.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Create New Issue</h1>
            <p className={styles.subtitle}>
              Fill in the details below and assign it to a team member.
            </p>
          </div>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/issues")}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title" type="text" name="title"
              placeholder="e.g. Login button not working on mobile"
              value={form.title} onChange={handleChange} required maxLength={200}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description" name="description" rows={5}
              placeholder="Describe the issue in detail…"
              value={form.description} onChange={handleChange}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="priority">Priority *</label>
              <select id="priority" name="priority"
                      value={form.priority} onChange={handleChange} required>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="status">Status *</label>
              <select id="status" name="status"
                      value={form.status} onChange={handleChange} required>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Assigned To — searchable */}
          <div className={styles.inputGroup}>
            <label htmlFor="assigned_to">Assigned To</label>

            <input
              type="text"
              placeholder="Search team members by name, email, or role…"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              disabled={staffLoading}
              className={styles.searchInput}
            />

            <select
              id="assigned_to"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleChange}
              disabled={staffLoading}
              size={Math.min(Math.max(filteredStaff.length + 1, 2), 6)}
            >
              <option value="">
                {staffLoading ? "Loading team members…" : "— Unassigned —"}
              </option>
              {filteredStaff.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.role ? ` (${p.role})` : ""}
                  {p.email ? ` · ${p.email}` : ""}
                </option>
              ))}
              {!staffLoading && filteredStaff.length === 0 && (
                <option disabled>No matching users</option>
              )}
            </select>

            <p className={styles.helperText}>
              {staffLoading
                ? "Fetching users from /user/all/…"
                : `${filteredStaff.length} of ${staff.length} user${
                    staff.length !== 1 ? "s" : ""
                  } shown.`}
            </p>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn}
                    onClick={() => navigate("/issues")} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? <ClipLoader color="#fff" size={20} /> : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewIssue;