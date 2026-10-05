Here's a complete **README.md** for the frontend of your Issue Tracker app. It covers setup, architecture, folder structure, API integration, and design decisions.

---

# Issue Tracker — Frontend

A modern React-based issue tracking application where teams can raise issues, discuss them Reddit-style, assign work, and track progress on a dashboard. Built with a clean white theme, contextual auth, and a modular component architecture.

---

##  Overview

| Page | What it does |
|---|---|
| **Login / Register** | Authenticate with username + password, receive JWT token |
| **Dashboard** | KPI cards, status/priority charts, issues assigned to you |
| **Issues** | Table view with search + filters (status, priority, assignee) |
| **Issue Detail** | Full issue view with editable fields, activity log, and **Reddit-style threaded comments** |
| **New Issue** | Create issue with title, description, priority, status, assignee |


---

##  Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18** | Component model, hooks, mature ecosystem |
| Routing | **react-router-dom v6** | Nested routes, `NavLink` active states |
| State | **React Context** (`LoginContext`) | Global auth/user state without Redux |
| HTTP | **`PosthData` helper** (`Components/titan.js`) | Centralizes base URL + auth token injection |
| Charts | **Recharts** | Small, React-friendly, works with plain data arrays |
| Icons | **react-icons** (`md` set) | Consistent Material icons, tree-shakeable |
| Loaders | **react-spinners** (`ClipLoader`) | Tiny, drop-in loading states |
| Styling | **CSS Modules** (`*.module.css`) | Scoped styles, no global collisions, works with Vite/CRA |

No TypeScript, no state library, no CSS-in-JS. Kept intentionally lightweight for fast iteration and easy review.

---

##  Folder Structure

```
src/
├── Components/
│   ├── titan.js                  # PosthData HTTP helper
│   └── ...                       # shared bits
├── Layout/
│   └── index.jsx                 # sidebar + header shell
├── loginContext.jsx              # auth context + provider
├── Pages/
│   ├── Dashboard/
│   │   ├── index.jsx
│   │   └── index.module.css
│   ├── Issues/
│   │   ├── index.jsx             # list + filters
│   │   └── index.module.css
│   ├── IssueDetail/
│   │   ├── index.jsx             # Reddit-style comments
│   │   └── index.module.css
│   ├── NewIssue/
│   │   ├── index.jsx
│   │   └── index.module.css
│   ├── Feed/
│   │   ├── index.jsx             # reddit-style feed
│   │   └── index.module.css
│   ├── Staff/
│   │   ├── index.jsx
│   │   └── index.module.css
│   ├── Profile/
│   │   ├── index.jsx
│   │   └── index.module.css
│   ├── Settings/
│   │   ├── index.jsx
│   │   └── index.module.css
│   ├── Login/
│   └── Register/
├── App.jsx
├── main.jsx
└── index.css
```

Each page owns its own `*.module.css`. Shared components (Header, Sidebar) live under `Layout/`.

---

##  Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd issue-tracker-frontend
npm install
```

### 2. Configure environment

Create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:8000
```

If you're using Vite instead of CRA:

```env
VITE_API_URL=http://localhost:8000
```

Update `Components/titan.js` to read from whichever prefix you use.

### 3. Run the dev server

```bash
npm start        # CRA
# or
npm run dev      # Vite
```

The app opens at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
```

Output goes to `build/` (CRA) or `dist/` (Vite).

---

##  Authentication

Tokens are handled by the `PosthData` helper. Every request automatically attaches an `Authorization: Bearer <token>` header when a token exists in `localStorage`.

### Login flow

1. `POST accounts/login/` with `{ username, password }`
2. Response includes `access_token` and user fields
3. Store token in `localStorage.setItem("token", ...)`
4. Populate `LoginContext` with user info (name, role, id, profile_pic, etc.)
5. Redirect to `/dashboard`

### Logout

```jsx
localStorage.removeItem("token");
localStorage.removeItem("firstTimeLogin");
loginContext.setToken(null);
navigate("/login");
```

### Protected routes

The `Layout` component reads `LoginContext`. If `token` is missing, it redirects to `/login`.

---

##  API Integration

All network calls go through `PosthData`:

```js
PosthData(extraData, endpoint, body);
```

| Argument | Meaning |
|---|---|
| `extraData` | Optional extra payload (rarely used — usually `null`) |
| `endpoint` | Path after the base URL, e.g. `"issues/"`, `"accounts/login/"` |
| `body` | Request body. `null` → GET. Object → POST with JSON. FormData → multipart |

### Example calls used in the app

```js
// Fetch all issues
const issues = await PosthData(null, "issues/", null);

// Fetch issues assigned to a specific user
const mine = await PosthData(null, `issues/assigned/${userId}/`, null);

// Create a new issue
await PosthData(null, "issues/create/", {
  title: "Login button not working on mobile",
  description: "...",
  priority: "high",
  assigned_to: "576078fb-3749-4540-bed9-bb8cb0c3d22b",
});

// Login
const data = await PosthData(null, "accounts/login/", { username, password });
```

### Backend endpoints used

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `accounts/login/` | Authenticate, get token |
| POST | `accounts/register/` | Create account |
| GET | `accounts/users/` | List staff (for assignee dropdowns, staff page) |
| GET | `issues/` | List all issues |
| GET | `issues/{id}/` | Get issue detail |
| GET | `issues/assigned/{userId}/` | Issues assigned to a user |
| POST | `issues/create/` | Create a new issue |
| POST | `issues/{id}/update/` | Update issue fields |
| GET | `issues/{id}/comments/` | Fetch comments |
| POST | `issues/{id}/comments/` | Post a comment |

Every authenticated endpoint expects:

```
Authorization: Bearer <access_token>
```

---

##  Theme & Styling

### Design language

- **Background:** `#f8fafc` (soft gray, easy on the eyes)
- **Cards:** white with `1px solid #f1f5f9` border and `0 1px 2px rgba(0,0,0,0.02)` shadow
- **Primary text:** `#0f172a` (near black)
- **Secondary text:** `#64748b` / `#94a3b8`
- **Primary action (dark button):** `#0f172a` background, white text
- **Accent (links):** `#2196F3`
- **Radius:** 10–16px consistently
- **Font:** Poppins via Google Fonts, fallback to system stack

### Badges (status / priority)

| Type | Colors |
|---|---|
| Priority `Low` | green (`#f0fdf4` / `#15803d`) |
| Priority `Medium` | yellow (`#fefce8` / `#a16207`) |
| Priority `High` | red (`#fef2f2` / `#b91c1c`) |
| Status `Open` | blue (`#eff6ff` / `#1d4ed8`) |
| Status `In Progress` | amber (`#fffbeb` / `#b45309`) |
| Status `Resolved` | emerald (`#ecfdf5` / `#047857`) |
| Status `Closed` | gray (`#f1f5f9` / `#475569`) |

### Avatars

Every user-facing avatar is an **initials circle** with a stable hue derived from the name:

```js
const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
// background: hsl(hue, 65%, 92%)  color: hsl(hue, 55%, 35%)
```

This means users always get the same color everywhere (header, cards, comments) without needing uploaded images. If `profile_pic` exists, we use the image; otherwise initials.

### Dark mode

Appearance settings are stored in `localStorage` under the key `appearance`. Apply with:

```js
document.documentElement.dataset.theme = appearance.theme; // "light" | "dark" | "system"
```

---

## 🔄 Data Flow

```
User action (click / submit)
        │
        ▼
React component updates local state (optimistic UI where it matters)
        │
        ▼
PosthData() → fetch with Authorization header
        │
        ▼
Backend validates token + processes request
        │
        ▼
JSON response → component state updated → re-render
```

Key flows:

- **Issue list** — fetched on mount, filtered locally with `useMemo`
- **Issue detail** — fetched by ID, comments rendered recursively as a tree
- **New issue** — posted once, then `navigate("/issues")`
- **Vote on comment** — local state update, no server round-trip required for MVP
- **Profile edits** — update `LoginContext` so the header re-renders instantly

---

##  Page Details

### Dashboard

- 4 KPI cards: total issues, open, in progress, assigned to me
- Pie chart for status, bar chart for priority (Recharts)
- "Assigned to You" list with clickable rows
- Loading skeleton while fetching

### Issues

- Table with columns: ID, title + description preview, priority badge, status badge, assignee chip, created date
- Filters: search, status, priority, assignee (including "Unassigned")
- Row click navigates to `/issues/:id`

### Issue Detail

- Editable title, description, status, priority, assignee
- **Reddit-style comment section**: threaded replies, vote arrows, OP tag, collapse toggle, inline reply box
- Sidebar with activity log
- Optimistic updates on status/priority change

### Feed

- Reddit-style cards with vote rail, comment preview, tags, save/share buttons
- Sort tabs: Hot / New / Top
- Sidebar: Raise an Issue button, popular tags, top contributors

### Staff

- Searchable, filterable table
- Slide-in detail panel with contact info, work info, activity stats
- Admin-only actions: Add Staff, Edit, Suspend

### Profile

- Avatar click-to-upload (preview shown immediately)
- Editable personal fields
- Read-only identifiers (role, user ID)
- Password change form with validation
- Stat grid + activity summary

### Settings

- Left tabs: Account / Notifications / Appearance / Privacy / Language / Danger Zone
- Toggle switches, radio cards, theme swatches
- Danger zone: sign out everywhere, delete account

---

##  Routing

| Path | Component |
|---|---|
| `/login` | `Login` |
| `/register` | `Register` |
| `/dashboard` | `Dashboard` |
| `/issues` | `Issues` |
| `/issues/new` | `NewIssue` |
| `/issues/:id` | `IssueDetail` |
| `/feed` | `Feed` |
| `/staff` | `Staff` |
| `/staff/new` | `NewStaff` |
| `/staff/:id/edit` | `EditStaff` |
| `/profile` | `Profile` |
| `/settings` | `Settings` |

Register them in `App.jsx`:

```jsx
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/issues"    element={<Issues />} />
<Route path="/issues/:id" element={<IssueDetail />} />
<Route path="/feed"      element={<Feed />} />
<Route path="/staff"     element={<Staff />} />
<Route path="/profile"   element={<Profile />} />
<Route path="/settings"  element={<Settings />} />
```

---

##  Testing the Integration

### Manually verify the token is attached

1. Log in
2. Open **DevTools → Network**
3. Click any authenticated request (e.g. `issues/`)
4. Look at **Request Headers** — you should see:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

If missing:

- Run `localStorage.getItem("token")` in the console — is it `null`?
- Add `console.log(headers)` in `PosthData` before `fetch()`
- Check that your backend expects `Bearer` and not `Token` prefix

### Test the assigned-issues endpoint

```js
await PosthData(null, "issues/assigned/576078fb-3749-4540-bed9-bb8cb0c3d22b/", null);
```

You should get back the sample:

```json
[
  {
    "id": "a91db60e-5abe-4096-9e1c-6f062e82e0e9",
    "title": "Login button not working on mobile",
    "status": "open",
    "priority": "high",
    "assigned_to": "576078fb-3749-4540-bed9-bb8cb0c3d22b"
  }
]
```

---

##  Design Decisions

**Why CSS Modules over Tailwind?**
CSS Modules keep component styles colocated with the component and avoid class-name collisions without adding a build-time dependency. Tailwind is great, but for a UI-heavy app with lots of nuanced states (badges, avatars, panels), CSS Modules made the JSX cleaner.

**Why `PosthData` instead of axios/fetch-inline?**
One function, one place to add auth headers, one place to change the base URL, one place to handle errors. Every call site stays two lines.

**Why initials avatars?**
Fast, no CDN, consistent visuals, no missing-image placeholder, no upload flow needed for the MVP. Uploads still work when `profile_pic` is set.

**Why local filtering instead of server-side?**
For the initial dataset size (<500 issues) it's instant. The moment backend pagination lands, swap the `filteredIssues` `useMemo` for a query-string push and a re-fetch.

**Why lowercase backend strings mapped to display labels?**
The backend returns `"open"` / `"high"` (lowercase). The UI shows `"Open"` / `"High"`. `normalizeIssue()` is the single place mapping between the two — no scattered `.toLowerCase()` calls.

**Why context for auth?**
The user object (name, role, id, avatar) is read in ~10 places (header, dropdown, permissions, greetings, avatar hues). Context avoids prop drilling.

---

##  Known Limitations

- No pagination yet — fetches the full issue list
- Comments are still local state on the detail page (backend integration ready but commented)
- Staff list endpoint (`accounts/users/`) is assumed — update the endpoint in `Issues.jsx` if yours differs
- Dark mode swaps a `data-theme` attribute — full CSS variable theming is a next step
- File upload for avatars currently converts to data URL; wire up `accounts/avatar/` when ready

---

##  Future Work

- Backend pagination + infinite scroll on Issues and Feed
- Server-side comment tree endpoint to replace local state
- Real-time updates via WebSocket (issue status changes, new comments)
- User invitation by email
- Activity audit log with filters
- Full dark theme with CSS variables
- E2E tests with Playwright covering login → create issue → comment flow


