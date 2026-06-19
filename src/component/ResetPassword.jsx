import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { resetPassword } from "../api/authApi";

const ResetPassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const validationSchema = yup.object({
    otp: yup.string().required("OTP is required").length(6, "OTP must be 6 characters"),
    password: yup
      .string()
      .matches(/(?=.*[a-z])/, "Must include lowercase letter")
      .matches(/(?=.*[A-Z])/, "Must include uppercase letter")
      .matches(/(?=.*[0-9])/, "Must include a number")
      .matches(/(?=.{8,})/, "Must not be less than 8 characters")
      .required("New password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const res = await resetPassword(values.otp, values.password, values.confirmPassword);
        if (res && res.success) {
          toast.success("Password reset successfully!");
          setLoading(false);
          navigate("/signin");
        } else {
          throw new Error("Invalid response structure from server");
        }
      } catch (err) {
        setLoading(false);
        if (err.response?.data?.message === "secretOrPrivateKey must have a value") {
          setError("Backend configuration error. Please contact support.");
          toast.error("Server configuration issue. Please try again later.");
        } else if (err.response && err.response.data) {
          setError(err.response.data.message);
          toast.error(err.response.data.message);
        } else {
          setError("Failed to reset password. Please try again.");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-6">
      <Toaster position="top-center" />
      <div className="bg-surface-800 p-8 text-surface-50 rounded-2xl shadow-card border border-surface-700 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label htmlFor="otp" className="block font-semibold mb-2 text-sm text-surface-300">
              OTP Code
            </label>
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="otp"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.otp}
            />
            {formik.touched.otp && formik.errors.otp && (
              <span className="text-red-400 text-xs mt-1 block">
                {formik.errors.otp}
              </span>
            )}
          </div>
          <div className="mb-5 relative">
            <label htmlFor="password" className="block font-semibold mb-2 text-sm text-surface-300">
              New Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete="off"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="password"
              placeholder="••••"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-red-400 text-xs mt-1 block">
                {formik.errors.password}
              </span>
            )}
            <span
              onClick={togglePasswordVisibility}
              className="absolute top-[42px] right-4 cursor-pointer text-surface-400 hover:text-surface-200"
            >
              {!passwordVisible ? (
                <IoEyeSharp size={20} />
              ) : (
                <BsEyeSlashFill size={20} />
              )}
            </span>
          </div>
          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block font-semibold mb-2 text-sm text-surface-300">
              Confirm New Password
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              autoComplete="off"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="confirmPassword"
              placeholder="••••"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <span className="text-red-400 text-xs mt-1 block">
                {formik.errors.confirmPassword}
              </span>
            )}
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute top-[42px] right-4 cursor-pointer text-surface-400 hover:text-surface-200"
            >
              {!confirmPasswordVisible ? (
                <IoEyeSharp size={20} />
              ) : (
                <BsEyeSlashFill size={20} />
              )}
            </span>
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 w-full rounded-lg transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="#ffffff" /> : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-surface-400">
          Remember your password?{" "}
          <a href="/signin" className="text-primary-400 hover:text-primary-300 font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
