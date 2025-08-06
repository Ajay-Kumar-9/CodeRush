'use client';

import { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaRegFile,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";

type TreeNode = {
  type: "file" | "folder";
  name: string;
  path: string;
  handle?: FileSystemFileHandle;
  children?: TreeNode[];
};

interface Props {
  structure: TreeNode[];
  onFileSelect: (node: TreeNode) => void;
}

const FolderStructure: React.FC<Props> = ({ structure, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newSet = new Set(expandedFolders);
    newSet.has(path) ? newSet.delete(path) : newSet.add(path);
    setExpandedFolders(newSet);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      const paddingLeft = `${depth * 16}px`;

      if (node.type === "folder") {
        const isExpanded = expandedFolders.has(node.path);

        return (
          <div key={node.path}>
            <div
              className="flex items-center cursor-pointer hover:bg-gray-700 rounded px-2 py-1 text-sm text-white select-none"
              style={{ paddingLeft }}
              onClick={() => toggleFolder(node.path)}
            >
              {isExpanded ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
              {isExpanded ? <FaFolderOpen className="text-yellow-400 mr-1" /> : <FaFolder className="text-yellow-400 mr-1" />}
              <span className="font-medium">{node.name}</span>
            </div>
            {isExpanded && node.children ? (
              <div>{renderTree(node.children, depth + 1)}</div>
            ) : null}
          </div>
        );
      } else {
        return (
          <div
            key={node.path}
            className="flex items-center cursor-pointer hover:bg-gray-700 rounded px-2 py-1 text-sm text-white select-none"
            style={{ paddingLeft }}
            onClick={() => onFileSelect(node)}
            title={node.path}
          >
            <FaRegFile className="text-gray-300 mr-2" />
            <span>{node.name}</span>
          </div>
        );
      }
    });

  return <div className="overflow-auto flex-1 font-mono bg-[#1e1e1e] h-full p-2">{renderTree(structure)}</div>;
};

export default FolderStructure;
