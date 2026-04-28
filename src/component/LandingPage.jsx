import React from "react";
import { motion } from "framer-motion";
import { FaComments, FaLock, FaBolt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <FaBolt className="text-accent-400 text-3xl mb-3" />,
    title: "Real-Time Messaging",
    desc: "Lightning-fast messages delivered instantly with Socket.io.",
  },
  {
    icon: <FaLock className="text-accent-400 text-3xl mb-3" />,
    title: "End-to-End Encryption",
    desc: "Your conversations stay private and secure at all times.",
  },
  {
    icon: <FaUsers className="text-accent-400 text-3xl mb-3" />,
    title: "Multi-Device Sync",
    desc: "Access your chats from anywhere, on any device.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-900 text-surface-50 flex flex-col">
      {/* ── Header ── */}
      <header className="px-8 py-5 flex justify-between items-center border-b border-surface-800">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <FaComments className="text-primary-400 text-2xl" />
          <span className="text-xl font-bold tracking-tight text-surface-50">
            Chatter<span className="text-primary-400">Box</span>
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/signup")}
          className="bg-primary-600 hover:bg-primary-500 transition-colors text-white px-5 py-2 rounded-full font-semibold text-sm shadow-card"
        >
          Get Started
        </motion.button>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row justify-center items-center flex-1 px-8 py-16 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl"
        >
          <span className="inline-block bg-primary-900 text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Real-time chat
          </span>
          <h2 className="text-5xl font-extrabold leading-tight mb-5 text-surface-50">
            Connect Instantly,{" "}
            <span className="text-primary-400">Chat Freely</span>
          </h2>
          <p className="text-lg text-surface-400 mb-8 leading-relaxed">
            A seamless messaging experience with real-time chat, media sharing,
            and end-to-end encryption — all in one place.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate("/signin")}
              className="bg-primary-600 hover:bg-primary-500 transition-colors text-white px-7 py-3 rounded-full font-semibold flex items-center gap-2 shadow-card"
            >
              <FaComments /> Start Chatting
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="border border-surface-600 hover:border-primary-400 hover:text-primary-300 transition-colors text-surface-300 px-7 py-3 rounded-full font-semibold"
            >
              Create Account
            </button>
          </div>
        </motion.div>

        <motion.img
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          src="https://images.unsplash.com/photo-1494253109108-2e30c049369b?q=80&w=2070&auto=format&fit=crop"
          alt="Chat Illustration"
          className="max-w-xs md:max-w-md rounded-2xl shadow-2xl ring-1 ring-surface-700 object-cover"
        />
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-800 py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-3 text-surface-50">
            Why ChatterBox?
          </h3>
          <p className="text-surface-400 mb-10">
            Everything you need for seamless communication.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-7 bg-surface-900 rounded-2xl shadow-card border border-surface-700 hover:border-primary-600 transition-colors text-left"
              >
                {f.icon}
                <h4 className="text-lg font-semibold text-surface-50 mb-2">
                  {f.title}
                </h4>
                <p className="text-surface-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-6 bg-surface-900 border-t border-surface-800">
        <p className="text-sm text-surface-500">
          &copy; {new Date().getFullYear()} ChatterBox. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
