// src/pages/Login.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import IconInput from "../components/IconInput";
import "../styles/auth.design.css";
import AuthImage from "../assets/auth-image.png";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED

export default function Login() {
  const { user } = useAuth(); // frontend-only
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // If already logged in, go to dashboard
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  function onSubmit(data) {
    // frontend-only demo login
    console.log("Login data (demo):", data);
    alert("Login successful (frontend-only demo)");
    navigate("/dashboard", { replace: true });
  }

  const EmailIcon = (
    <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
      <path d="M2 2h20v12H2z" stroke="#222" strokeWidth="1.2" />
      <path d="M2 2l10 7 10-7" stroke="#222" strokeWidth="1.2" />
    </svg>
  );

  const LockIcon = (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="#222"
        strokeWidth="1.2"
      />
      <path d="M7 10V8a5 5 0 0110 0v2" stroke="#222" strokeWidth="1.2" />
    </svg>
  );

  return (
    <div className="di-page">
      <div className="di-card di-image-card">
        <div className="di-image-inner">
          <img src={AuthImage} alt="auth visual" />
        </div>
      </div>

      <div className="di-card di-form-card">
        <div className="di-form-inner">
          <AuthHeader />

          <h1 className="di-title">Login</h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="di-form"
            noValidate
          >
            <IconInput
              id="email"
              label="Email"
              icon={EmailIcon}
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              error={errors.email}
            />

            <IconInput
              id="password"
              label="Password"
              type="password"
              icon={LockIcon}
              register={register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters",
                },
              })}
              error={errors.password}
            />

            <button className="di-cta" type="submit">
              Sign In
            </button>
          </form>

          <div className="di-links">
            <Link to="/signup" className="di-link-left">
              Create an account
            </Link>
            <Link to="#" className="di-link-right">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
