import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { signUp } from "../api/authApi";

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate = useNavigate();

  const validationSchema = yup.object({
    username: yup.string().required("Username is required"),
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
    number: yup
      .string()
      .matches(/^(\+234|234|0)[789][01]\d{8}$/, "Please enter a valid Nigerian phone number (e.g., 09087654321)")
      .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      number: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const res = await signUp(values);
        setLoading(false);
        toast.success("Sign up Successful!");
        navigate("/signin");
      } catch (err) {
        setLoading(false);
        if (err.response.status === 400) {
          toast.error("Fill in appropriately");
          setError(err.response.data.message);
        } else if (err.response.status === 409) {
          setError(err.response.data.message);
          toast.error("Duplicate user found");
        } else {
          setError("An unexpected error occurred");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex p-9 items-center justify-center bg-surface-900">
      <Toaster position="top-center" />

      <div className="bg-surface-800 p-8 text-surface-50 rounded-2xl shadow-card border border-surface-700 w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block font-semibold mb-2 text-sm text-surface-300">
              Username
            </label>
            <input
              type="text"
              placeholder="Jane"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="username"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.username}
            />
            {formik.touched.username && formik.errors.username && (
              <span className="text-red-400 text-xs mt-1 block">
                {formik.errors.username}
              </span>
            )}
          </div>
          <div className="mb-4">
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
              <span className="text-red-400 text-xs mt-1 block">{formik.errors.email}</span>
            )}
          </div>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block font-semibold mb-2 text-sm text-surface-300">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete="off"
              placeholder="••••••••"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              name="password"
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
              {!passwordVisible ? <IoEyeSharp /> : <BsEyeSlashFill />}
            </span>
          </div>
          <div className="mb-6">
            <label htmlFor="number" className="block font-semibold mb-2 text-sm text-surface-300">
              Phone Number
            </label>
            <input
              type="tel"
              name="number"
              id="number"
              className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
              placeholder="09087654321"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.number}
            />
            {formik.touched.number && formik.errors.number && (
              <span className="text-red-400 text-xs mt-1 block">{formik.errors.number}</span>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 w-full rounded-lg transition-colors shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="#ffffff" /> : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-surface-400">
          Already have an account?{" "}
          <a href="/signin" className="text-primary-400 hover:text-primary-300 font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
