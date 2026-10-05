// NewIssue.jsx
import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { LoginContext } from "../../loginContext.jsx";
import { PosthData, fetchUserData } from "../../Components/titan.js";
import styles from "./index.module.css";
import Layout from "../../Layout/index.jsx";

const PRIORITIES = [
  { value: "Low",    label: "Low",    hint: "Nice to have" },
  { value: "Medium", label: "Medium", hint: "Standard" },
  { value: "High",   label: "High",   hint: "Blocking work" },
];

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const toApiStatus   = (s) => s.toLowerCase().replace(/\s+/g, "_");
const toApiPriority = (p) => p.toLowerCase();

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const NewIssue = () => {
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const token = loginContext?.token;
  const titleRef = useRef(null);

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [staff, setStaff]               = useState([]);
  const [staffSearch, setStaffSearch]   = useState("");
  const [staffLoading, setStaffLoading] = useState(true);
  const [showPicker, setShowPicker]     = useState(false);
  const [pickerPos, setPickerPos]       = useState(null);

  const pickerRef  = useRef(null);
  const triggerRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    assigned_to: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Load users from /user/all/ ---------------- */
  useEffect(() => {
    if (!token) {
      setStaffLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchUserData(token, "user/all/");
        const list = Array.isArray(data) ? data : data?.results ?? [];
        if (cancelled) return;

        setStaff(
          list
            .filter((u) => !u.deleted_at)
            .map((u) => ({
              id:   u.id,
              name:
                [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
                u.username || u.email || "Unknown",
              role:  u.role ?? "user",
              email: u.email ?? "",
            }))
        );
      } catch (err) {
        console.warn("Failed to load /user/all/, using fallback:", err);
        if (!cancelled) {
          setStaff([
            { id: "576078fb-3749-4540-bed9-bb8cb0c3d22b", name: "Alice Wanjiru",  role: "admin", email: "alice@example.com" },
            { id: "a1b2c3d4-1111-2222-3333-444455556666", name: "Brian Otieno",    role: "user",  email: "brian@example.com" },
            { id: "b2c3d4e5-2222-3333-4444-555566667777", name: "Cynthia Mwangi",  role: "user",  email: "cynthia@example.com" },
            { id: "c3d4e5f6-3333-4444-5555-666677778888", name: "David Kimani",    role: "user",  email: "david@example.com" },
            { id: "d4e5f6a7-4444-5555-6666-777788889999", name: "Esther Njeri",    role: "admin", email: "esther@example.com" },
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

  const selectedStaff = useMemo(
    () => staff.find((s) => s.id === form.assigned_to) || null,
    [staff, form.assigned_to]
  );

  /* ---------------- Click-outside ---------------- */
  useEffect(() => {
    const onClick = (e) => {
      if (
        pickerRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) {
        return;
      }
      setShowPicker(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* ---------------- Recompute picker position on open / scroll / resize ---------------- */
  useEffect(() => {
    if (!showPicker || !triggerRef.current) return;

    const update = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setPickerPos({
        top:   rect.bottom + 6,
        left:  rect.left,
        width: rect.width,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [showPicker]);

  /* ---------------- Keyboard shortcuts ---------------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) {
        if (showPicker) {
          setShowPicker(false);
        } else {
          navigate("/issues");
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !loading) {
        document.getElementById("new-issue-submit")?.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate, loading, showPicker]);

  /* ---------------- Autofocus title ---------------- */
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePriority = (value) => {
    setForm((prev) => ({ ...prev, priority: value }));
  };

  const clearAssignee = () => {
    setForm((prev) => ({ ...prev, assigned_to: "" }));
    setStaffSearch("");
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (form.title.trim().length > 200) errors.title = "Title is too long.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
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

  /* ---------------- Render ---------------- */
  return (
    <Layout className={styles.page}>
      <div className={styles.wrapper}>
        {/* ---------- Top bar ---------- */}
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/issues")}
          >
            ← Back to Issues
          </button>
          <span className={styles.topHint}>
            <kbd>⌘</kbd> + <kbd>↵</kbd> to create · <kbd>Esc</kbd> to cancel
          </span>
        </div>

        <form className={styles.layout} onSubmit={handleSubmit}>
          {/* ============ MAIN COLUMN ============ */}
          <div className={styles.main}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h1 className={styles.title}>Create New Issue</h1>
                <p className={styles.subtitle}>
                  Describe the problem and assign it to a team member.
                </p>
              </div>

              <div className={styles.cardBody}>
                {/* Title */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="title">
                      Title <span className={styles.required}>*</span>
                    </label>
                    <span className={styles.counter}>
                      {form.title.length}/200
                    </span>
                  </div>
                  <input
                    ref={titleRef}
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Short, descriptive summary"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                    className={fieldErrors.title ? styles.inputError : ""}
                  />
                  {fieldErrors.title && (
                    <p className={styles.fieldError}>{fieldErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className={styles.field}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={8}
                    placeholder={
                      "What happened?\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected:\nActual:"
                    }
                    value={form.description}
                    onChange={handleChange}
                  />
                  <p className={styles.helperText}>
                    Markdown supported. Include steps to reproduce if possible.
                  </p>
                </div>

                {/* Priority pills */}
                <div className={styles.field}>
                  <label>Priority</label>
                  <div className={styles.pillRow}>
                    {PRIORITIES.map((p) => {
                      const active = form.priority === p.value;
                      return (
                        <button
                          type="button"
                          key={p.value}
                          className={`${styles.pill} ${
                            active ? styles[`pill${p.value}`] : ""
                          }`}
                          onClick={() => handlePriority(p.value)}
                          aria-pressed={active}
                        >
                          <span className={styles.pillDot} />
                          <span className={styles.pillLabel}>{p.label}</span>
                          <span className={styles.pillHint}>{p.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ SIDEBAR ============ */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <div className={styles.cardBody}>
                {/* Status */}
                <div className={styles.field}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee picker */}
                <div className={styles.field}>
                  <label>Assigned To</label>

                  {selectedStaff ? (
                    <div className={styles.selectedUser}>
                      <span className={styles.avatar}>
                        {initials(selectedStaff.name)}
                      </span>
                      <div className={styles.selectedUserMeta}>
                        <span className={styles.selectedUserName}>
                          {selectedStaff.name}
                        </span>
                        <span className={styles.selectedUserRole}>
                          {selectedStaff.role}
                          {selectedStaff.email && ` · ${selectedStaff.email}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.clearUser}
                        onClick={clearAssignee}
                        aria-label="Clear assignee"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      ref={triggerRef}
                      type="button"
                      className={styles.pickerTrigger}
                      onClick={() => setShowPicker((v) => !v)}
                      disabled={staffLoading}
                    >
                      <span className={styles.avatarPlaceholder}>?</span>
                      <span>
                        {staffLoading
                          ? "Loading team members…"
                          : "Unassigned — click to pick"}
                      </span>
                      <span className={styles.chevron}>▾</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ============ STICKY FOOTER ============ */}
          <div className={styles.footerBar}>
            <div className={styles.footerInner}>
              {error && <p className={styles.errorText}>{error}</p>}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => navigate("/issues")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  id="new-issue-submit"
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={loading || !form.title.trim()}
                >
                  {loading ? <ClipLoader color="#fff" size={18} /> : "Create Issue"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ============ PORTAL: Assignee dropdown ============ */}
      {showPicker &&
        !selectedStaff &&
        pickerPos &&
        createPortal(
          <div
            ref={pickerRef}
            className={styles.pickerPortal}
            style={{
              top:   pickerPos.top,
              left:  pickerPos.left,
              width: pickerPos.width,
            }}
          >
            <input
              type="text"
              placeholder="Search by name, email, or role…"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              autoFocus
              className={styles.pickerSearch}
            />
            <div className={styles.pickerList}>
              {filteredStaff.length === 0 ? (
                <p className={styles.pickerEmpty}>
                  No users match "{staffSearch}"
                </p>
              ) : (
                filteredStaff.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={styles.pickerItem}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, assigned_to: p.id }));
                      setShowPicker(false);
                      setStaffSearch("");
                    }}
                  >
                    <span className={styles.avatar}>
                      {initials(p.name)}
                    </span>
                    <span className={styles.pickerItemMeta}>
                      <span className={styles.pickerItemName}>
                        {p.name}
                      </span>
                      <span className={styles.pickerItemRole}>
                        {p.role}
                        {p.email && ` · ${p.email}`}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </Layout>
  );
};

export default NewIssue;