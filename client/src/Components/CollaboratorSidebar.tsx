import React from "react";
import { RxCross2 } from "react-icons/rx";
import { FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";

interface CollaboratorSidebarProps {
  onClose: () => void;
  collaborators: string[];
}

export default function CollaboratorSidebar({
  onClose,
  collaborators,
}: CollaboratorSidebarProps) {
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Copied to clipboard!", { duration: 2000 });
  };

  return (
    <div className="fixed top-[55px] lg:right-0 md:right-0 sm:right-0 lg:w-[320px] md:w-[320px] sm:w-[320px] w-full h-[calc(100vh-55px)] bg-white z-50 flex flex-col rounded-bl-2xl shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-teal-600">
        <p className="text-white font-semibold text-lg">Collaborators</p>
        <RxCross2
          className="text-white cursor-pointer hover:text-red-500"
          onClick={onClose}
        />
      </div>

      <div className="p-4 text-sm text-gray-700 space-y-2">
        {collaborators.length === 0 ? (
          <p className="text-gray-500 italic">No collaborators yet.</p>
        ) : (
          collaborators.map((id, index) => {
            const initials = id.slice(0, 2).toUpperCase();
            return (
              <div
                key={id}
                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-2 rounded group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-xs text-gray-800 font-mono">{`${
                    index + 1
                  }. ${id}`}</span>
                </div>
                <button
                  onClick={() => handleCopy(id)}
                  className="text-gray-500 hover:text-black opacity-0 group-hover:opacity-100 transition"
                  title="Copy ID"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
