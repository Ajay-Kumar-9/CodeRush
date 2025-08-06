"use client";

import React, { useRef, useEffect } from "react";
import {
  FaFolder,
  FaChevronRight,
  FaChevronDown,
  FaRegFolderOpen,
} from "react-icons/fa";
import { MdOutlineFileOpen } from "react-icons/md";
import { Socket } from "socket.io-client";
import FolderStructure from "./FolderStructure";

type TreeNode = {
  type: "file" | "folder";
  name: string;
  path: string;
  handle?: FileSystemFileHandle;
  children?: TreeNode[];
};

interface SidebarProps {
  sessionId: string;
  openFile: (file: { name: string; path: string; content: string }) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  treeStructure: TreeNode[] | null;
  isRootExpanded: boolean;
  toggleRootFolder: () => void;
  FolderOpen: () => void;
  socket: Socket | null;
  isHost: boolean;
  handleMap: Map<string, FileSystemHandle>;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessionId,
  openFile,
  isExpanded,
  setIsExpanded,
  treeStructure,
  isRootExpanded,
  toggleRootFolder,
  FolderOpen,
  socket,
  isHost,
  handleMap,
}) => {
  const emittedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    emittedPaths.current.clear();
  }, [treeStructure]);

  const readFileContent = async (node: TreeNode): Promise<string> => {
    let handle = node.handle;

    if (!handle && isHost) {
      const h = handleMap.get(node.path);
      if (h instanceof FileSystemFileHandle) {
        handle = h;
      } else {
        console.error("Handle not found in map for:", node.path);
        return "// ⚠️ Handle not found.";
      }
    }

    if (!handle || node.type !== "file") return "";

    try {
      const file = await handle.getFile();
      return await file.text();
    } catch (err) {
      console.error("Error reading file:", err);
      return "// ⚠️ Failed to read file content.";
    }
  };

  const handleFileClick = async (node: TreeNode) => {
    if (node.type !== "file") return;

    let content = "";

    if (isHost) {
      content = await readFileContent(node);
      const fileData = { name: node.name, content, path: node.path };
      openFile(fileData);

      if (!emittedPaths.current.has(node.path) && socket) {
        socket.emit("fileOpened", { file: fileData, sessionId });
        emittedPaths.current.add(node.path);
      }
    } else {
      // Guests request file from host
      socket?.emit("request-file", { path: node.path, sessionId });
    }
  };

  return (
    <aside
      className={`bg-[#1e1e1e] text-white ${
        isExpanded ? "w-64" : "w-16"
      } flex flex-col h-full transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FaFolder className="text-yellow-400" />
          {isExpanded && (
            <span className="text-sm font-semibold text-gray-200">
              EXPLORER
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-transform"
        >
          <FaChevronRight
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isHost ? (
        <div className="pl-3 py-2 flex gap-3 items-center text-gray-300 border-b border-gray-700">
          <button
            onClick={FolderOpen}
            title="Open Folder"
            className="hover:text-white"
          >
            <FaRegFolderOpen size={18} />
          </button>
          <MdOutlineFileOpen
            size={18}
            className="opacity-50"
            title="Open File (disabled)"
          />
        </div>
      ) : (
        <></>
      )}

      <div className="flex-1 overflow-auto py-2">
        {treeStructure?.map((root, idx) => (
          <div key={idx}>
            {isExpanded && (
              <div
                onClick={toggleRootFolder}
                className="flex items-center gap-1 px-2 py-1 cursor-pointer text-sm hover:bg-gray-700 rounded select-none"
              >
                {isRootExpanded ? (
                  <FaChevronDown className="text-gray-400" />
                ) : (
                  <FaChevronRight className="text-gray-400" />
                )}
                <FaFolder className="text-yellow-400" />
                <span className="font-medium">{root.name}</span>
              </div>
            )}
            {isRootExpanded && isExpanded && (
              <FolderStructure
                structure={root.children || []}
                onFileSelect={handleFileClick}
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
