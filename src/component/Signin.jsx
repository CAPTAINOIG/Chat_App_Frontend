import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from "formik";
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';


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
                // console.log(res);
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
        <div className="min-h-screen flex p-9 items-center justify-center bg-blue-800">
            <div className="bg-white p-8 text-blue-800 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl text-blue-800 font-bold mb-6 text-center">Sign In</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={formik.handleSubmit}>
                    <div className="h-[80px] my-3">
                        <label htmlFor="email" className="font-semibold my-1">Email</label><br />
                        <input
                            type="email"
                            placeholder="jane@gmail.com"
                            className="px-4 py-2 w-full border-2 mt-1 border-blue-800 focus:outline-blue-800"
                            name="email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <span className="text-red-500 my-1">{formik.errors.email}</span>
                        )}
                    </div>
                    <div className="h-[80px] relative my-3">
                        <label htmlFor="password" className="font-semibold">Password</label><br />
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            autoComplete="off"
                            className="border-2 mt-1 border-blue-800 py-2 px-4 w-full focus:outline-blue-800"
                            name="password"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <span className="text-red-500 my-1">{formik.errors.password}</span>
                        )}
                        <span onClick={togglePasswordVisibility} className="absolute top-[42px] right-5 cursor-pointer">
                            {!passwordVisible ? <IoEyeSharp /> : <BsEyeSlashFill />}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-800 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={20} color='#ffffff' /> : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signin;
