"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaRobot,
  FaComments,
  FaPhone,
  FaBolt,
  FaCode,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Footer from "@/Components/Footer";

export default function LandingPage() {
  const NEXT_PUBLIC_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const Router = useRouter();

  const Login = () => {
    Router.push(`/auth/login`);
  };

  return (
    <div className="min-h-screen bg-[#06044B]">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-[#06044B]/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <FaCode className="h-8 w-8" />
            <span className="text-2xl font-bold">CodeRush</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <button className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-[#06044B] transition">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-4 py-2 bg-white text-[#06044B] rounded-lg font-semibold hover:bg-[#E2C98C] transition">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Collaborate on Code
          <br />
          <span className="text-[#E2C98C]">in Real-Time</span>
        </motion.h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
          Collaborate seamlessly with real-time code editing, AI help, voice
          calls, and instant team chat. Innovate together faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={Login}
            className="flex items-center justify-center gap-2 bg-white text-[#06044B] px-4 py-4 text-lg font-semibold rounded-lg hover:bg-[#E2C98C] transition w-[200px] sm:w-auto"
          >
            <FaBolt className="h-5 w-5" />
            Start Coding
          </button>
          <Link href="/auth/signup">
            <button className="px-8 py-4 text-lg border border-white text-white hover:bg-white hover:text-[#06044B] rounded-lg transition w-[200px] sm:w-auto mt-4 sm:mt-0">
              Signup Now
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#ffffff] to-[#f5f5f5] text-[#06044B]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for Seamless Collaboration
            </h2>
            <p className="text-lg sm:text-xl text-[#06044B]/70 max-w-2xl mx-auto">
              Real-time tools built for developers — code, communicate, and
              create together, faster than ever.
            </p>
          </div>

          {/* Main Features Flex Container */}
          <div className="flex flex-wrap justify-center gap-6 lg:px-16 md:px-8 sm:px-4 px-2">
            {[
              {
                icon: <FaUsers />,
                title: "Real-time Editing",
                desc: "Collaborate live with shared cursors, instant code updates, and seamless teamwork.",
              },
              {
                icon: <FaComments />,
                title: "Live Chat",
                desc: "Talk with your teammates without leaving the editor using integrated messaging.",
              },
              {
                icon: <FaPhone />,
                title: "Voice Calling",
                desc: "Jump into instant voice calls directly from your coding workspace.",
              },
              {
                icon: <FaRobot />,
                title: "AI Assistance",
                desc: "Get smart suggestions, bug fixes, and explanations from your built-in AI coding assistant.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl shadow-lg transition-all border border-[#06044B]/10 bg-gradient-to-br from-white to-[#f9f9f9] hover:shadow-xl flex flex-col h-auto w-full sm:w-[45%] lg:w-[22%]"
              >
                <div className="text-4xl mb-4 bg-gradient-to-tr from-[#06044B] to-[#1a5b5c] text-[#E2C98C] p-3 rounded-full shadow-md h-[80px] w-[80px] flex justify-center items-center">
                  {item.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#06044B]">
                  {item.title}
                </h3>
                <p className="text-[#06044B]/70 flex-grow">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#06044B] text-center text-[#E2C98C]">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Collaborate Smarter. Build Faster.
        </h2>
        <p className="text-lg sm:text-xl text-[#E2C98C]/80 mb-8 max-w-2xl mx-auto">
          Experience seamless teamwork with developers worldwide. Code together,
          innovate in real time, and bring your ideas to life — all in one
          place.
        </p>
        <Link href="/auth/signup">
          <button className="px-2 py-2 text-lg bg-white text-[#06044B] hover:bg-[#E2C98C] rounded-lg font-semibold transition w-[200px] hover:cursor-pointer">
            Get Started
          </button>
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
