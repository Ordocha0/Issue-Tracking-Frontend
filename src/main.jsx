import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoginContext } from "./loginContext.jsx";
// import ProtectedRoute from "./ProtectedRoute.jsx";
import ErrorBoundary from './ErrorBoundary.jsx';

// Import Pages
import Login from './Pages/Login/index.jsx'
import NewIssue from './Pages/NewIssue/index.jsx';
import Issues from './Pages/Issues/index.jsx';
import IssueDetail from './Pages/IssueDetail/index.jsx';

// Admin
import Dashboard from './Pages/Admin/Dashboard/index.jsx';


const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/admin/dashboard", element: <Dashboard />},
  { path: "/issues/new", element: <NewIssue />},
  { path: "/issues", element: <Issues />},
  { path: "/issues/:id", element: <IssueDetail />},
]);

export default function AppWrapper() {
  const getValue = (key, fallback = "") => sessionStorage.getItem(key) || fallback;

  const [userName, setUserName] = useState(() => getValue("userName"));
  const [phone, setPhone] = useState(() => getValue("phone"));
  const [email, setEmail] = useState(() => getValue("email"));
  const [role, setRole] = useState(() => getValue("role"));
  const [firstName, setFirstName] = useState(() => getValue("firstName"));
  const [lastName, setLastName] = useState(() => getValue("lastName"));
  const [token, setToken] = useState(() => getValue("token"));
  const [serverIp, setServerIp] = useState(import.meta.env.VITE_SERVER_IP);
  const [user_id , setUser_id] = useState(() => getValue("user_id"));
  const [profile_pic , setProfile_pic] = useState(() => getValue("profile_pic"));
  const [national_id , setNational_id] = useState(() => getValue("national_id"));
  const [errorToken , setErrorToken] = useState(() => getValue("errorToken"));
  const [form , setForm] = useState({})
  const [firstTimeLogin, setFirstTimeLogin] = useState(() => {
    // Check if they have ever completed onboarding tour locally before
    const hasSeenTour = localStorage.getItem("hasCompletedOnboardingTour");
    // If they have completed it, firstTimeLogin is false. If they haven't, it's true!
    return hasSeenTour !== "true";
  });
  // Sync state to sessionStorage
  useEffect(() => {
    if (userName) sessionStorage.setItem("userName", userName);
    else sessionStorage.removeItem("userName");
  }, [userName]);

  useEffect(() => {
    if (phone) sessionStorage.setItem("phone", phone);
    else sessionStorage.removeItem("phone");
  }, [phone]);

  useEffect(() => {
    if (email) sessionStorage.setItem("email", email);
    else sessionStorage.removeItem("email");
  }, [email]);

  useEffect(() => {
    if (role) sessionStorage.setItem("role", role);
    else sessionStorage.removeItem("role");
  }, [role]);

  useEffect(() => {
    if (firstName) sessionStorage.setItem("firstName", firstName);
    else sessionStorage.removeItem("firstName");
  }, [firstName]);

  useEffect(() => {
    if (lastName) sessionStorage.setItem("lastName", lastName);
    else sessionStorage.removeItem("lastName");
  }, [lastName]);

  useEffect(() => {
    if (token) sessionStorage.setItem("token", token);
    else sessionStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user_id) sessionStorage.setItem("user_id", user_id);
    else sessionStorage.removeItem("user_id");
  }, [user_id]);

  useEffect(() => {
    if (profile_pic) sessionStorage.setItem("profile_pic", profile_pic);
    else sessionStorage.removeItem("profile_pic");
  }, [profile_pic]);

  useEffect(() => {
    if (national_id) sessionStorage.setItem("national_id", national_id);
    else sessionStorage.removeItem("national_id");
  }, [national_id]);

  useEffect(() => {
    if (errorToken) sessionStorage.setItem("errorToken", errorToken);
    else sessionStorage.removeItem("errorToken");
  }, [errorToken]);

  useEffect(() => {
    if (form) sessionStorage.setItem("form", form);
    else sessionStorage.removeItem("form");
  }, []);

  useEffect(() => {
  localStorage.setItem("firstTimeLogin", JSON.stringify(firstTimeLogin));
}, [firstTimeLogin]);


  return (
    <ErrorBoundary>
      <LoginContext.Provider
        value={{
          userName, setUserName,
          phone, setPhone,
          email, setEmail,
          role, setRole,
          firstName, setFirstName,
          lastName, setLastName,
          token, setToken,
          serverIp, setServerIp,
          user_id, setUser_id,
          profile_pic, setProfile_pic,
          national_id, setNational_id,
          errorToken, setErrorToken,
          form, setForm,
          firstTimeLogin, setFirstTimeLogin
        }}
      >
        <RouterProvider router={router} />
      </LoginContext.Provider>
    </ErrorBoundary>
  );
}


createRoot(document.getElementById('root')).render(<AppWrapper />);
