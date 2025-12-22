// src/pages/Signup.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import IconInput from "../components/IconInput";
import "../styles/auth.design.css";
import AuthImage from "../assets/auth-image.png";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED

export default function Signup() {
  const { user } = useAuth(); // frontend-only
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  useEffect(() => {
    // If already logged in, go to dashboard
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  function onSubmit(data) {
    // frontend-only demo submit
    console.log("Signup data (demo):", data);
    alert("Account created successfully (frontend-only demo)");
    navigate("/dashboard", { replace: true });
  }

  const UserIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#222" strokeWidth="1.2" />
      <path
        d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6"
        stroke="#222"
        strokeWidth="1.2"
      />
    </svg>
  );

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

  const LocIcon = (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c3.866 0 7 3.134 7 7 0 5.25-7 13-7 13s-7-7.75-7-13c0-3.866 3.134-7 7-7z"
        stroke="#222"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="9" r="2" stroke="#222" strokeWidth="1.2" />
    </svg>
  );

  return (
    <div className="di-page di-reverse">
      <div className="di-card di-form-card">
        <div className="di-form-inner">
          <AuthHeader
            title="Welcome to Civix"
            subtitle="Join our platform to make your voice heard in local governance."
          />

          <h1 className="di-title">Sign Up</h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="di-form"
            noValidate
          >
            <IconInput
              id="name"
              label="Full Name"
              icon={UserIcon}
              register={register("name", {
                required: "Name is required",
              })}
              error={errors.name}
            />

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

            <IconInput
              id="location"
              label="Location"
              icon={LocIcon}
              register={register("location", {
                required: "Location is required",
              })}
              error={errors.location}
            />

            <div className="di-select-row">
              <select
                className="di-select"
                {...register("role", { required: "Select role" })}
              >
                <option value="">Select role</option>
                <option value="citizen">Citizen</option>
                <option value="official">Official</option>
              </select>
              {errors.role && (
                <div className="di-field-error">{errors.role.message}</div>
              )}
            </div>

            <button className="di-cta" type="submit">
              Create Account
            </button>
          </form>

          <div className="di-links single">
            <Link to="/login" className="di-link-left">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>

      <div className="di-card di-image-card">
        <div className="di-image-inner">
          <img src={AuthImage} alt="auth visual" />
        </div>
      </div>
    </div>
  );
}
