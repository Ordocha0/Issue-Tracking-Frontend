// IssueDetail.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { LoginContext } from "../../loginContext";
import {
  fetchUserData,
  PosthData,
  PutData,
  DeleteData,
} from "../../Components/titan.js";
import styles from "./index.module.css";
import Layout from "../../Layout/index.jsx";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES   = ["Open", "In Progress", "Resolved", "Closed"];

// ---------- normalize helpers ----------
const toTitleCase = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const normalizeStatus   = (s) => toTitleCase((s || "open").toLowerCase());
const normalizePriority = (p) => toTitleCase((p || "low").toLowerCase());
const toApiStatus       = (s) => s.toLowerCase().replace(/\s+/g, "_");
const toApiPriority     = (p) => p.toLowerCase();
const shortId           = (id) =>
  typeof id === "string" && id.length > 8 ? id.slice(0, 8) + "…" : id;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ---------- comment tree helpers ----------
function insertReply(tree, parentId, newComment) {
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, replies: [...(node.replies || []), newComment] };
    }
    if (node.replies?.length) {
      return { ...node, replies: insertReply(node.replies, parentId, newComment) };
    }
    return node;
  });
}

function removeComment(tree, commentId) {
  return tree
    .filter((node) => node.id !== commentId)
    .map((node) =>
      node.replies?.length
        ? { ...node, replies: removeComment(node.replies, commentId) }
        : node
    );
}

function updateComment(tree, commentId, updater) {
  return tree.map((node) => {
    if (node.id === commentId) return updater(node);
    if (node.replies?.length) {
      return { ...node, replies: updateComment(node.replies, commentId, updater) };
    }
    return node;
  });
}

function buildCommentTree(flatComments) {
  const map = new Map();
  const roots = [];

  flatComments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  flatComments.forEach((c) => {
    const node = map.get(c.id);
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id).replies.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (arr) => {
    arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    arr.forEach((n) => sortRec(n.replies));
  };
  sortRec(roots);
  return roots;
}

// ============================================================
//  Comment component (recursive)
// ============================================================
function Comment({
  comment,
  depth = 0,
  onReply,
  onDelete,
  onEdit,
  currentUser,
}) {
  const [replying, setReplying]   = useState(false);
  const [replyText, setReplyText] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const [editing, setEditing]     = useState(false);
  const [editText, setEditText]   = useState(comment.body);

  const isAuthor  = currentUser?.user_id === comment.user_id;
  const isAdmin   = currentUser?.role === "admin";
  const canModify = isAuthor || isAdmin;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setReplying(false);
  };

  const handleEditSubmit = async () => {
    if (!editText.trim() || editText === comment.body) {
      setEditing(false);
      return;
    }
    await onEdit(comment.id, editText.trim());
    setEditing(false);
  };

  const authorName = comment.author
    ? [comment.author.first_name, comment.author.last_name]
        .filter(Boolean)
        .join(" ") ||
      comment.author.email ||
      "Unknown"
    : "Unknown";

  return (
    <div
      className={styles.commentNode}
      style={{ marginLeft: depth > 0 ? 24 : 0 }}
    >
      {depth > 0 && <div className={styles.threadLine} />}

      <div className={styles.commentInner}>
        <div className={styles.commentHeader}>
          <div className={styles.avatar}>{initials(authorName)}</div>
          <span className={styles.commentAuthor}>{authorName}</span>
          {isAuthor && <span className={styles.opTag}>OP</span>}
          <span className={styles.commentTime}>
            · {timeAgo(comment.created_at)}
          </span>
          {comment.updated_at && (
            <span className={styles.commentTime}>(edited)</span>
          )}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? "[+]" : "[−]"}
          </button>
        </div>

        {!collapsed && (
          <>
            {editing ? (
              <div className={styles.replyForm}>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div className={styles.replyFormActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.body);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleEditSubmit}
                    disabled={!editText.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.commentBody}>{comment.body}</p>
            )}

            <div className={styles.commentActions}>
              <button
                className={styles.replyBtn}
                onClick={() => setReplying((r) => !r)}
              >
                {replying ? "Cancel" : "Reply"}
              </button>

              {canModify && !editing && (
                <>
                  {isAuthor && (
                    <button
                      className={styles.replyBtn}
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => {
                      if (window.confirm("Delete this comment?")) {
                        onDelete(comment.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {replying && (
              <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                <textarea
                  rows={3}
                  placeholder={`Reply to ${authorName}…`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                />
                <div className={styles.replyFormActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setReplying(false);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}

            {comment.replies?.length > 0 && (
              <div className={styles.replies}>
                {comment.replies.map((child) => (
                  <Comment
                    key={child.id}
                    comment={child}
                    depth={depth + 1}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {collapsed && (
          <p className={styles.collapsedHint}>
            {comment.replies?.length || 0} repl
            {comment.replies?.length === 1 ? "y" : "ies"} hidden
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  Main page
// ============================================================
const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loginContext = useContext(LoginContext);
  const token = loginContext?.token;

  const [issue, setIssue]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [users, setUsers]             = useState([]);
  const [comments, setComments]       = useState([]);
  const [newComment, setNewComment]   = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ title: "", description: "" });

  const commentBoxRef = useRef(null);

  // ---------- helpers ----------
  const userName = (userId) => {
    if (!userId) return "Unassigned";
    const u = users.find((x) => x.id === userId);
    if (!u) return shortId(userId);
    return (
      [u.first_name, u.last_name].filter(Boolean).join(" ") ||
      u.email ||
      shortId(userId)
    );
  };

  // ---------- Load users (once) ----------
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchUserData(token, "user/all/");
        const list = Array.isArray(data) ? data : data?.results ?? [];
        if (!cancelled) setUsers(list.filter((u) => !u.deleted_at));
      } catch (err) {
        console.warn("Could not load users:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // ---------- Load issue + comments ----------
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Not authenticated. Please log in again.");
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const rawIssue = await fetchUserData(token, `issues/get/${id}`);

        let rawComments = [];
        try {
          rawComments = await fetchUserData(token, `comments/issue/${id}`);
        } catch (err) {
          console.warn("Comments endpoint failed, showing empty list:", err);
        }

        if (cancelled) return;

        const normalizedIssue = {
          ...rawIssue,
          status:   normalizeStatus(rawIssue.status),
          priority: normalizePriority(rawIssue.priority),
        };

        const flat = Array.isArray(rawComments)
          ? rawComments
          : rawComments?.results ?? [];

        const flatNormalized = flat.map((c) => ({
          id:         c.id,
          parent_id:  c.parent_id ?? null,
          user_id:    c.user_id,
          body:       c.body,
          created_at: c.created_at,
          updated_at: c.updated_at,
          author:     c.author ?? null,
        }));

        setIssue(normalizedIssue);
        setDraft({
          title:       normalizedIssue.title,
          description: normalizedIssue.description,
        });
        setComments(buildCommentTree(flatNormalized));
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load issue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  // ==========================================================
  //  ISSUE UPDATES  ->  PUT /issues/:id
  // ==========================================================
  const handleFieldChange = async (field, value) => {
    if (!issue) return;
    const previous = issue[field];

    // optimistic
    setIssue((prev) => ({ ...prev, [field]: value }));
    setSaving(true);
    setSaveMsg("");

    try {
      const payload =
        field === "status"      ? { status:      toApiStatus(value)   } :
        field === "priority"    ? { priority:    toApiPriority(value) } :
        field === "assigned_to" ? { assigned_to: value || null        } :
        { [field]: value };

      const updated = await PutData(token, `issues/${issue.id}`, payload);

      // Trust the server response if it returns the updated issue
      if (updated && typeof updated === "object") {
        setIssue((prev) => ({
          ...prev,
          ...updated,
          status:   normalizeStatus(updated.status     ?? prev.status),
          priority: normalizePriority(updated.priority ?? prev.priority),
        }));
      }

      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch (err) {
      // rollback
      setIssue((prev) => ({ ...prev, [field]: previous }));
      setError(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!issue) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await PutData(token, `issues/${issue.id}`, {
        title:       draft.title.trim(),
        description: draft.description.trim(),
      });

      setIssue((prev) => ({
        ...prev,
        ...(updated && typeof updated === "object" ? updated : draft),
        status:   normalizeStatus(updated?.status     ?? prev.status),
        priority: normalizePriority(updated?.priority ?? prev.priority),
      }));

      setEditing(false);
      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  //  COMMENTS
  // ==========================================================
  const authorFallback = () => ({
    id:         loginContext?.user_id,
    first_name: loginContext?.firstName,
    last_name:  loginContext?.lastName,
    email:      loginContext?.email,
    role:       loginContext?.role,
  });

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const created = await PosthData(token, "comments", {
        issue_id: id,
        body: newComment.trim(),
      });

      const node = {
        id:         created.id,
        parent_id:  null,
        user_id:    created.user_id,
        body:       created.body,
        created_at: created.created_at,
        updated_at: created.updated_at ?? null,
        author:     created.author ?? authorFallback(),
        replies:    [],
      };

      setComments((prev) => [...prev, node]);
      setNewComment("");
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleReply = async (parentId, body) => {
    try {
      const created = await PosthData(token, "comments", {
        issue_id:  id,
        parent_id: parentId,
        body,
      });

      const node = {
        id:         created.id,
        parent_id:  parentId,
        user_id:    created.user_id,
        body:       created.body,
        created_at: created.created_at,
        updated_at: created.updated_at ?? null,
        author:     created.author ?? authorFallback(),
        replies:    [],
      };

      setComments((prev) => insertReply(prev, parentId, node));
    } catch (err) {
      setError(err.message || "Failed to post reply");
    }
  };

  const handleEdit = async (commentId, body) => {
    try {
      await PutData(token, `comments/${commentId}`, { body });
      setComments((prev) =>
        updateComment(prev, commentId, (node) => ({
          ...node,
          body,
          updated_at: new Date().toISOString(),
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to edit comment");
    }
  };

  // ---------- Delete a comment ----------
  // Note: DELETE does not send a body. Passing `null` used to make the
  // backend's body-parser throw `"null" is not valid JSON`. If your
  // DeleteData helper still requires a third arg, pass `undefined`
  // or make the helper skip the body when it's null/undefined.
  const handleDelete = async (commentId) => {
    try {
      await DeleteData(token, `comments/${commentId}`);
      setComments((prev) => removeComment(prev, commentId));
    } catch (err) {
      setError(err.message || "Failed to delete comment");
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <Layout className={styles.page}>
        <div className={styles.loadingBox}>
          <ClipLoader color="#0f172a" size={28} />
          <p>Loading issue…</p>
        </div>
      </Layout>
    );
  }

  if (error && !issue) {
    return (
      <Layout className={styles.page}>
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/issues")}
          >
            Back to Issues
          </button>
        </div>
      </Layout>
    );
  }

  if (!issue) return null;

  const creatorName = userName(issue.created_by);

  return (
    <Layout className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate("/issues")}>
        ← Back to Issues
      </button>

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* --- Issue card --- */}
          <div className={styles.card}>
            <div className={styles.issueHeader}>
              <span className={styles.issueId}>#{shortId(issue.id)}</span>
              {editing ? (
                <input
                  className={styles.titleInput}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              ) : (
                <h1 className={styles.issueTitle}>{issue.title}</h1>
              )}
            </div>

            <div className={styles.metaRow}>
              <span
                className={`${styles.badge} ${
                  styles[
                    "status-" + issue.status.replace(/\s+/g, "-").toLowerCase()
                  ]
                }`}
              >
                {issue.status}
              </span>
              <span
                className={`${styles.badge} ${
                  styles["priority-" + issue.priority.toLowerCase()]
                }`}
              >
                {issue.priority}
              </span>
              <span className={styles.metaText}>
                opened by <strong>{creatorName}</strong>
                {issue.created_at && <> · {timeAgo(issue.created_at)}</>}
              </span>
            </div>

            <div className={styles.section}>
              {editing ? (
                <textarea
                  className={styles.descInput}
                  rows={7}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              ) : (
                <p className={styles.issueBody}>{issue.description}</p>
              )}
            </div>

            <div className={styles.actionsBar}>
              {editing ? (
                <>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setEditing(false);
                      setDraft({
                        title:       issue.title,
                        description: issue.description,
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.primaryBtn}
                    onClick={handleSaveEdits}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              )}
              {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
            </div>

            {/* Inline error banner for update failures */}
            {error && issue && (
              <p className={styles.errorText} style={{ marginTop: 12 }}>
                {error}
              </p>
            )}
          </div>

          {/* --- Comments --- */}
          <div className={styles.card}>
            <div className={styles.commentsHeader}>
              <h2 className={styles.commentsTitle}>
                Comments ({countComments(comments)})
              </h2>
            </div>

            <form
              className={styles.newCommentForm}
              onSubmit={handlePostComment}
            >
              <div className={styles.newCommentLeft}>
                <div className={styles.avatar}>
                  {initials(loginContext?.userName || "You")}
                </div>
              </div>
              <div className={styles.newCommentRight}>
                <textarea
                  ref={commentBoxRef}
                  rows={3}
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className={styles.newCommentActions}>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={!newComment.trim() || postingComment}
                  >
                    {postingComment ? "Posting…" : "Comment"}
                  </button>
                </div>
              </div>
            </form>

            <div className={styles.commentsDivider} />

            <div className={styles.commentTree}>
              {comments.length === 0 ? (
                <p className={styles.emptyComments}>
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                comments.map((c) => (
                  <Comment
                    key={c.id}
                    comment={c}
                    depth={0}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    currentUser={loginContext}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- Sidebar --- */}
        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.sidebarTitle}>Properties</h3>

            <div className={styles.property}>
              <label>Status</label>
              <select
                value={issue.status}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                disabled={saving}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.property}>
              <label>Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                disabled={saving}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.property}>
              <label>Assigned To</label>
              <select
                value={issue.assigned_to || ""}
                onChange={(e) =>
                  handleFieldChange("assigned_to", e.target.value)
                }
                disabled={saving}
              >
                <option value="">— Unassigned —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") ||
                      u.email}{" "}
                    ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.propertyStatic}>
              <label>Created by</label>
              <div className={styles.assigneeChip}>
                <span className={styles.avatarSm}>
                  {initials(creatorName)}
                </span>
                {creatorName}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

function countComments(tree) {
  return tree.reduce(
    (sum, node) => sum + 1 + (node.replies ? countComments(node.replies) : 0),
    0
  );
}

export default IssueDetail;