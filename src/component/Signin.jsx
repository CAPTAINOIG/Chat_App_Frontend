import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from "formik";
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import GoogleAuth from './GoogleAuth';


const baseUrl = "https://chat-app-backend-seuk.onrender.com"
// const baseUrl = "http://localhost:3000"


const Signin = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const navigate = useNavigate()
    const validationSchema = yup.object({
        email: yup.string().email('Invalid email format').required("Email is required"),
        password: yup.string()
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
                const res = await axios.post(`${baseUrl}/user/signin`, values);
                localStorage.setItem('userToken', (res.data.token))
                localStorage.setItem('userId', res.data.user._id)
                localStorage.setItem('username', (res.data.user.username))
                toast.success("User signed in successfully!");
                navigate('/dashboard')
            } catch (err) {
                setLoading(false);
                if (err.response && err.response.data) {
                    setError(err.response.data.message);
                    toast.error('Wrong password, please type the correct password');
                } else {
                    setError("Wrong email, please type the correct email");
                }
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-800 p-6">
            <div className="bg-white p-8 text-blue-800 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
                
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                <form onSubmit={formik.handleSubmit}>
                    {/* Email Input */}
                    <div className="h-[80px] my-3">
                        <label htmlFor="email" className="font-semibold">Email</label>
                        <input
                            type="email"
                            placeholder="jane@gmail.com"
                            className="px-4 py-2 w-full border-2 mt-1 border-blue-800 rounded-lg focus:outline-blue-800"
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <span className="text-red-500 text-sm">{formik.errors.email}</span>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="h-[80px] relative my-3">
                        <label htmlFor="password" className="font-semibold">Password</label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            autoComplete="off"
                            className="border-2 mt-1 border-blue-800 py-2 px-4 w-full rounded-lg focus:outline-blue-800"
                            name="password"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <span className="text-red-500 text-sm">{formik.errors.password}</span>
                        )}
                        <span
                            onClick={togglePasswordVisibility}
                            className="absolute top-[42px] right-5 cursor-pointer text-blue-800"
                        >
                            {!passwordVisible ? <IoEyeSharp size={20} /> : <BsEyeSlashFill size={20} />}
                        </span>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right text-sm text-blue-600 hover:underline mb-4 cursor-pointer">
                        <a href="/forgot-password">Forgot Password?</a>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        className="bg-blue-800 hover:bg-blue-500 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color="#ffffff" /> : "Sign In"}
                    </button>
                </form>

                <div className="flex items-center justify-center my-4">
                    <div className="w-full border-t border-gray-300"></div>
                    <span className="px-3 text-gray-500">OR</span>
                    <div className="w-full border-t border-gray-300"></div>
                </div>

                {/* <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100"
                >
                    <FcGoogle size={20} className="mr-2" />
                    Sign in with Google
                </button> */}

                <GoogleAuth/>

                <p className="text-center text-sm mt-4">
                    New here? <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a>
                </p>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signin;
