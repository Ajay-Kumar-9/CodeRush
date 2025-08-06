"use client";

import Editor from "@monaco-editor/react";
import { IoClose } from "react-icons/io5";
import React, { useEffect, useState } from "react";

// Type definition for an OpenFile
interface OpenFile {
  name: string;
  path: string;
  content: string;
}

interface CodeEditorProps {
  openFiles: OpenFile[];
  activeFile: OpenFile | null;
  setActiveFile: (file: OpenFile) => void;
  updateFileContent: (file: OpenFile) => void;
  closeFile: (file: OpenFile) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  openFiles,
  activeFile,
  setActiveFile,
  updateFileContent,
  closeFile,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editorFile, setEditorFile] = useState<OpenFile>({
    name: "untitled",
    path: "untitled",
    content: "",
  });

  useEffect(() => {
    if (activeFile) {
      setEditorFile(activeFile);
      setIsLoading(false);
    } else {
      setEditorFile({
        name: "untitled",
        path: "untitled",
        content: "File is empty or not loaded yet",
      });
      setIsLoading(true);
    }
  }, [activeFile]);

  // Handle editor content change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent({ ...editorFile, content: value });
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex bg-[#1e1e1e] text-white border-b border-gray-700 overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file.path}
            onClick={() => setActiveFile(file)}
            className={`flex items-center px-4 py-2 text-sm cursor-pointer border-r border-gray-700 transition-colors ${
              activeFile?.path === file.path
                ? "bg-[#2a2a2a]"
                : "hover:bg-[#2a2a2a]"
            }`}
          >
            <span className="truncate max-w-[150px]">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file);
              }}
              className="ml-2 hover:text-red-500"
              aria-label={`Close ${file.name}`}
            >
              <IoClose size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Loading content...
          </div>
        ) : editorFile.content ? (
          <Editor
            key={editorFile.path}
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={editorFile.content}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No file content available.
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
