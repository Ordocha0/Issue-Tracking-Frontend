import React, { useState, useContext } from "react";
import style from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { PosthData } from "../../Components/titan.js";
import { LoginContext } from "../../loginContext";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const loginContext = useContext(LoginContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await PosthData(null, "user/login/", form);

      // ---------- Sanity check: is this really a successful login? ----------
      if (!data || !data.token) {
        throw new Error("Login failed: no token returned by server.");
      }

      // ---------- Map backend fields -> context setters ----------
      // Username is NOT returned by the backend; compose a display name instead.
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
        data.email?.split("@")[0] ||
        "User";

      loginContext.setUserName(displayName);        // "Admin User"
      loginContext.setFirstName(data.first_name ?? "");
      loginContext.setLastName(data.last_name   ?? "");
      loginContext.setEmail(data.email          ?? "");
      loginContext.setPhone(data.phone          ?? "");  // was phone_no ❌
      loginContext.setRole(data.role            ?? "user"); // was user_role ❌
      loginContext.setToken(data.token);
      loginContext.setUser_id(data.id);
      loginContext.setForm(form);

      // Optional fields the backend doesn't return — set to null safely
      loginContext.setProfile_pic?.(data.profile_pic ?? null);
      loginContext.setNational_id?.(data.national_id ?? null);

      // ---------- Persist for refresh-safe sessions ----------
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          role: data.role,
        })
      );

      // ---------- Onboarding tour flag ----------
      const tourCompleted =
        localStorage.getItem("hasCompletedOnboardingTour") === "true";
      loginContext.setFirstTimeLogin(!tourCompleted);

      // ---------- Role-based redirect ----------
      const role = (data.role || "").toLowerCase();
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/dashboard");
      } else {
        // Unknown role — don't silently do nothing
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.brandSection}>
        <div className={style.overlay}>
          <h1 className={style.brandTagline}>
            Welcome back to your community.
          </h1>
        </div>
      </div>

      <div className={style.formSection}>
        <form className={style.form} onSubmit={handleSubmit}>
          <div className={style.header}>
            <h2>Welcome Back!</h2>
            <p>Login to your account.</p>
          </div>

          <div className={style.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className={style.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={style.signupBtn} disabled={loading}>
            {loading ? <ClipLoader color="#0C0C0C" size={20} /> : "Log In"}
          </button>

          {error && <p className={style.errorText}>{error}</p>}

          {/* <label
            className={style.forgotPassword}
            onClick={() => navigate("/forgotpassword")}
          >
            Forgotten Password?
          </label> */}
        </form>

        <p className={style.disclaimer}>
          By continuing, you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default SignUp;