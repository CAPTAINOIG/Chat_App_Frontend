import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import GoogleAuth from "./GoogleAuth";
import { toast, Toaster } from "sonner";
import { signIn } from "../api/authApi";
import useAuthStore from "../store/auth";

const Signin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate = useNavigate();
  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup
      .string()
      .matches(/(?=.*[a-z])/, "Must include lowercase letter")
      .matches(/(?=.*[A-Z])/, "Must include uppercase letter")
      .matches(/(?=.*[0-9])/, "Must include a number")
      .matches(/(?=.{8,})/, "Must not be less than 8 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const res = await signIn(values);
        if (res && res.success && res.data) {
          const { user, token } = res.data;
          if (user && token) {
            setAuth(user, token);
            toast.success("Signed in successfully!");
            setLoading(false);
            navigate("/dashboard");
          } else {
            throw new Error("User or token missing in response data");
          }
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
          toast.error("Wrong password, please type the correct password");
        } else {
          setError("Wrong email, please type the correct email");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-6">
      <Toaster position="top-center" />
      <div className="bg-surface-800 p-8 text-surface-50 rounded-2xl shadow-card border border-surface-700 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block font-semibold mb-2 text-sm text-surface-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-400 text-xs mt-1 block">
                {formik.errors.email}
              </span>
            )}
          </div>
          <div className="mb-5 relative">
            <label htmlFor="password" className="block font-semibold mb-2 text-sm text-surface-300">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete="off"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="password"
              placeholder="••••••••"
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
          <div className="text-right text-sm text-primary-400 hover:text-primary-300 mb-6 cursor-pointer">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 w-full rounded-lg transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign In"}
          </button>
        </form>
        <div className="flex items-center justify-center my-6">
          <div className="w-full border-t border-surface-700"></div>
          <span className="px-3 text-surface-500 text-sm">OR</span>
          <div className="w-full border-t border-surface-700"></div>
        </div>
        <GoogleAuth />
        <p className="text-center text-sm mt-6 text-surface-400">
          New here?{" "}
          <a href="/signup" className="text-primary-400 hover:text-primary-300 font-semibold">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signin;
