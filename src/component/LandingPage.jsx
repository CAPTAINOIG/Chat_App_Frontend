import React from "react";
import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate()
      return (
        <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-600 text-white flex flex-col">
          <header className="p-6 flex justify-between items-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
            >
              WhatsApp Chat App
            </motion.h1>
            <button onClick={() => navigate('/signup')} className="bg-white hover:bg-black text-blue-600 px-4 py-2 rounded-full font-semibold">
              Get Started
            </button>
          </header>
    
          <section className="flex flex-col md:flex-row justify-center items-center flex-1 p-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-xl"
            >
              <h2 className="text-5xl font-extrabold leading-tight mb-4">
                Connect Instantly with <span className="text-blue-200">WhatsApp Chat</span>
              </h2>
              <p className="text-lg text-gray-100 mb-6">
                A seamless messaging experience with real-time chat, media sharing, and end-to-end encryption.
              </p>
              <button onClick={() => navigate('/signin')} className="bg-white hover:bg-black text-blue-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                <FaWhatsapp className="text-xl" /> Start Chatting
              </button>
            </motion.div>
            <motion.img
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              src="https://images.unsplash.com/photo-1494253109108-2e30c049369b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Chat Illustration"
              className="max-w-xs md:max-w-md mt-6 md:mt-0 rounded-lg shadow-sm opacity-100"
            />
          </section>
    
          <section className="bg-white text-blue-800 py-12 px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-8">Why Choose Our Chat App?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-blue-50 rounded-lg shadow-md">
                  <h4 className="text-xl font-semibold">Real-Time Messaging</h4>
                  <p className="text-gray-600">Stay connected with lightning-fast messages.</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg shadow-md">
                  <h4 className="text-xl font-semibold">End-to-End Encryption</h4>
                  <p className="text-gray-600">Your conversations remain private and secure.</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg shadow-md">
                  <h4 className="text-xl font-semibold">Multi-Device Sync</h4>
                  <p className="text-gray-600">Access your chats from anywhere, on any device.</p>
                </div>
              </div>
            </div>
          </section>
    
          <footer className="text-center py-6 bg-blue-700">
            <p className="text-sm">&copy; 2025 WhatsApp Chat App. All rights reserved.</p>
          </footer>
        </div>
      );
    }
    

export default LandingPage