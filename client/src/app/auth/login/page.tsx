"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { nanoid } from "nanoid";

export default function LoginPage() {
  const router = useRouter();

  const createRoom = () => {
    const sessionId = nanoid(6); // Generate a unique session ID
    router.push(`/CodeEditor/${sessionId}`);
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong!");
        return;
      }

      // If login is successful, redirect to the editor page
      toast.success(data.message );

      createRoom();
    } catch (error) {
      const e = error as Error;
      toast.error(e.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#06044B" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-6"
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Code2 className="h-9 w-9" style={{ color: "#F5E0B7" }} />
            <span className="text-2xl font-bold" style={{ color: "#06044B" }}>
              CodeRush
            </span>
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "#06044B" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#4A4A4A", fontSize: "0.9rem" }}>
            Sign in to your account to continue coding
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: "#06044B" }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: "#F9F9F9",
                color: "#06044B",
                borderColor: "#CCCCCC",
              }}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: "#06044B" }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: "#F9F9F9",
                color: "#06044B",
                borderColor: "#CCCCCC",
              }}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Sign In Button */}
          <button
            className="w-full py-2 rounded-lg font-medium transition"
            style={{
              backgroundColor: "#F5E0B7",
              color: "#06044B",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#E2C98C")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#F5E0B7")
            }
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <div className="text-center text-sm" style={{ color: "#4A4A4A" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="hover:underline"
              style={{ color: "#F5E0B7" }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
