"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaCode, FaComments, FaPhone, FaUsers, FaRobot, FaLink, FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";

interface NavbarProps {
  onChatClick: () => void;
  onVoiceClick: () => void;
  onCollaboratorClick: () => void;
  onAiHelpClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onChatClick, onVoiceClick, onCollaboratorClick, onAiHelpClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);

  const navItems = [
    { label: "Chat", icon: <FaComments size={15} />, action: onChatClick },
    { label: "Voice Call", icon: <FaPhone size={15} />, action: onVoiceClick },
    { label: "Collaborators", icon: <FaUsers size={15} />, action: onCollaboratorClick },
    { label: "AI Assistance", icon: <FaRobot size={15} />, action: onAiHelpClick },
  ];

  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "U";

  const copyInviteLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success("Invite link copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy invite link.");
        console.error(err);
      });
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); 
    toast.success("Logged out successfully!");
    window.location.href = "/auth/login"; 
  };

  return (
    <header className="bg-teal-900 text-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-xl font-bold flex justify-center items-center gap-2">
          <FaCode size={25} />
          <p>CodeRush</p>
        </div>

       
        <nav className="hidden md:flex space-x-6 text-sm items-center">
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-1 cursor-pointer hover:text-teal-300"
            >
              {item.icon}
              <span className="text-[16px]">{item.label}</span>
            </div>
          ))}
        </nav>

        
        <div className="hidden md:flex items-center gap-6 text-sm">
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-3 py-1 border border-teal-300 rounded-md hover:bg-teal-800 transition-colors hover:cursor-pointer"
          >
            <FaLink />
            Invite
          </button>
          
         
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-300 text-white flex items-center justify-center font-semibold">
              {initials}
            </div>
            <span className="ml-1">{user ? `Welcome, ${user.firstName}` : "Welcome, User"}</span>

           
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 border border-teal-300 rounded-md hover:bg-teal-800 transition-colors hover:cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        
        <button
          className="md:hidden text-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm">
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                item.action();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 hover:text-teal-300 cursor-pointer"
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
          <div className="text-sm mt-2">{user ? `Welcome, ${user.firstName}` : "Welcome, User"}</div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
