"use client";

import { useState } from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  // State for form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Update specific field value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      const response = await fetch(
        `https://coderush-mr1i.onrender.com/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Send formData to the backend
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong!");
        return;
      }

      toast.success("Account created successfully!");

      // Save user data to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        })
      );
      // Redirect to login page after successful signup
      window.location.href = "/auth/login";
    } catch (error) {
      const e = error as Error;
      console.error(e.message)
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="h-auto min-h-screen flex items-center justify-center p-3"
      style={{ backgroundColor: "#06044B" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-6"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Code2 className="h-8 w-8" style={{ color: "#F5E0B7" }} />
            <span className="text-2xl font-bold" style={{ color: "#06044B" }}>
              CodeRush
            </span>
          </div>
          <h2 className="text-lg font-semibold" style={{ color: "#06044B" }}>
            Create your account
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="firstName"
                className="text-sm font-medium"
                style={{ color: "#06044B" }}
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none text-sm"
                style={{
                  backgroundColor: "#F9F9F9",
                  color: "#06044B",
                  borderColor: "#CCCCCC",
                }}
                value={formData.firstName}
                onChange={handleChange} // Bind to state
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="lastName"
                className="text-sm font-medium"
                style={{ color: "#06044B" }}
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none text-sm"
                style={{
                  backgroundColor: "#F9F9F9",
                  color: "#06044B",
                  borderColor: "#CCCCCC",
                }}
                value={formData.lastName}
                onChange={handleChange} // Bind to state
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
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
              placeholder="john@example.com"
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none text-sm"
              style={{
                backgroundColor: "#F9F9F9",
                color: "#06044B",
                borderColor: "#CCCCCC",
              }}
              value={formData.email}
              onChange={handleChange} // Bind to state
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
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
              placeholder="Create a strong password"
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none text-sm"
              style={{
                backgroundColor: "#F9F9F9",
                color: "#06044B",
                borderColor: "#CCCCCC",
              }}
              value={formData.password}
              onChange={handleChange} // Bind to state
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium"
              style={{ color: "#06044B" }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none text-sm"
              style={{
                backgroundColor: "#F9F9F9",
                color: "#06044B",
                borderColor: "#CCCCCC",
              }}
              value={formData.confirmPassword}
              onChange={handleChange} // Bind to state
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium text-sm transition"
            style={{
              backgroundColor: "#F5E0B7",
              color: "#06044B",
              boxShadow: "0 3px 4px rgba(0, 0, 0, 0.15)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#E2C98C")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#F5E0B7")
            }
          >
            Create Account
          </button>

          {/* Login Redirect */}
          <div className="text-center text-xs" style={{ color: "#4A4A4A" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="hover:underline"
              style={{ color: "#F5E0B7" }}
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
