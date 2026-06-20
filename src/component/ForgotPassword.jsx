import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { forgotPassword } from "../api/authApi";
import useAuthStore from "../store/auth";

const ForgotPassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const navigate = useNavigate();
  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const res = await forgotPassword(values);
        if (res && res.success && res.data) {
          const { user, token } = res.data;
          if (user && token) {
            setAuth(user, token);
            toast.success("Password reset email sent successfully!");
            setLoading(false);
            navigate("/reset-password");
          } else {
            throw new Error("User or token missing in response data");
          }
        } else {
          throw new Error("Invalid response structure from server");
        }
      } catch (err) {
        console.log(res)
        setLoading(false);
        if (err.response?.data?.message === "secretOrPrivateKey must have a value") {
          setError("Backend configuration error. Please contact support.");
          toast.error("Server configuration issue. Please try again later.");
        } else if (err.response && err.response.data) {
          setError(err.response.data.message);
          toast.error(err.response.data.message);
        } else {
          setError("Wrong email, please type the correct email");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-6">
      <Toaster position="top-center" />
      <div className="bg-white dark:bg-surface-800 p-8 text-surface-900 dark:text-surface-50 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password?</h2>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block font-semibold mb-2 text-sm text-surface-600 dark:text-surface-300">
              Enter Your Email Address
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              className="px-4 py-3 w-full bg-surface-100 dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg text-surface-900 dark:text-surface-50 placeholder-surface-400 dark:placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 dark:text-red-400 text-xs mt-1 block">
                {formik.errors.email}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 w-full rounded-lg transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="#ffffff" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
