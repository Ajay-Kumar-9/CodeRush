"use client";
import React from "react";
import Link from "next/link";
import { FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";

export default function Footer() {
  return (
    <div>
      <footer className="bg-[#06044B] text-[#E2C98C] py-12 px-4 border-t border-[#E2C98C]/20 pt-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center">
            <p className="text-[#E2C98C]/80 mb-6 text-[14px]">
              Building the future of collaborative coding, one project at a
              time.
            </p>

            <div className="flex space-x-6 text-[#E2C98C] mb-6">
              <Link
                href="https://www.linkedin.com/in/ajay-kumar036/"
                target="_blank"
              >
                <FaLinkedin className="h-8 w-8 hover:text-white transition-colors" />
              </Link>
              <Link href="https://github.com/Ajay-Kumar-9" target="_blank">
                <FaGithub className="h-8 w-8 hover:text-white transition-colors" />
              </Link>
              <Link href="https://ajay-kumar-eight.vercel.app/" target="_blank">
                <FaGlobe className="h-8 w-8 hover:text-white transition-colors" />
              </Link>
            </div>

            <div className="text-[#E2C98C]/80">
              <p>&copy; 2025 Ajay Kumar. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
