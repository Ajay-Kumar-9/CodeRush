"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";
import CodeEditor from "@/Components/CodeEditor";
import ChatSidebar from "@/Components/ChatSidebar";
import CollaboratorSidebar from "@/Components/CollaboratorSidebar";
import VoiceSidebar from "@/Components/VoiceSidebar";
import AiHelpSidebar from "@/Components/AISidebar";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

export type OpenFile = { name: string; path: string; content: string };
export type TreeNode = {
  type: "file" | "folder";
  name: string;
  path: string;
  handle?: FileSystemFileHandle;
  children?: TreeNode[];
};

interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

type FileSystemPermissionMode = "read" | "readwrite";
type PermissionState = "granted" | "denied" | "prompt";

interface FileSystemHandleWithPermission extends FileSystemHandle {
  requestPermission?(options: {
    mode: FileSystemPermissionMode;
  }): Promise<PermissionState>;
}

// Define a custom type that includes the requestPermission method
interface FileSystemHandleWithPermission extends FileSystemHandle {
  requestPermission?(options: {
    mode: FileSystemPermissionMode;
  }): Promise<PermissionState>;
}

const Index: React.FC = () => {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const socketRef = useRef<Socket | null>(null);

  //setup state for voice call
  const [caller, setCaller] = useState<string | null>(null);
  const [incomingOffer, setIncomingOffer] =
    useState<RTCSessionDescriptionInit | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [endCall, setEndCall] = useState<boolean | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const [treeStructure, setTreeStructure] = useState<TreeNode[] | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFile, setActiveFile] = useState<OpenFile>({
    name: "untitled",
    path: "untitled",
    content:
      `// ⚠️ Avoid selecting the root folder.\n` +
      `// ✅ Pick a folder *inside* it to work on files.\n` +
      `// 💡 Or just start coding below — no folder needed!\n\n`,
  });

  const [activePanel, setActivePanel] = useState<
    "Chat" | "Collaborators" | "Voice" | "AI" | null
  >(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRootExpanded, setIsRootExpanded] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const isHostRef = useRef(false);
  const fullTreeRef = useRef<TreeNode[] | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [userName, setUserName] = useState<string>("");

  //creating a pper connection
  const createPeerConnection = (remoteSocketId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received");
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current
          .play()
          .catch((e) => console.warn("Remote audio autoplay failed:", e));
      }
    };

    return pc;
  };

  //reject call handler
  const rejectCall = useCallback(() => {
    socketRef.current?.emit("reject-call", {
      to: caller,
      from: socketRef.current?.id,
    });
    cleanupCall();
  }, [caller]);

  const findFileNode = useCallback(
    (nodes: TreeNode[] | null, path: string): TreeNode | undefined => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.path === path && node.type === "file") return node;
        if (node.children) {
          const child = findFileNode(node.children, path);
          if (child) return child;
        }
      }
    },
    []
  );

  //listeners that listen from socket server
  useEffect(() => {
    if (!sessionId) return;
    if (!socketRef.current) socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.emit("joinRoom", sessionId);

    //asign role
    socket.on("role-assigned", ({ isHost }) => {
      setIsHost(isHost);
      isHostRef.current = isHost;
    });

    socket.on("your-name", (name: string) => {
      setUserName(name);
    });

    //chat message
    socket.on("chat-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, text: message }]);
    });

    socket.on("treeStructure", ({ structure, expanded }) => {
      if (!isHostRef.current) setTreeStructure(structure);
      setIsRootExpanded(expanded);
    });

    //file request update logic

    socket.on("request-file", async ({ path, requesterId }) => {
      if (!isHostRef.current) return;

      const fileNode = findFileNode(fullTreeRef.current, path);
      if (!fileNode?.handle) return;

      try {
        const file = await fileNode.handle.getFile();
        const content = await file.text();
        const openFile: OpenFile = { name: file.name, path, content };
        socket.emit("file-response", {
          file: openFile,
          sessionId,
          to: requesterId,
        });
      } catch (err) {
        console.error("[Error] Reading/sending file:", err);
      }
    });

    socket.on("fileOpened", ({ file }: { file: OpenFile }) => {
      setOpenFiles((prev) =>
        prev.find((f) => f.path === file.path) ? prev : [...prev, file]
      );
      setActiveFile(file);
    });

    socket.on("fileUpdated", ({ file }: { file: OpenFile }) => {
      setOpenFiles((prev) =>
        prev.map((f) => (f.path === file.path ? file : f))
      );
      setActiveFile(file);
    });

    // Voice call logic
    socket.on("incoming-call", ({ from, offer }) => {
      setCaller(from);
      setIncomingOffer(offer);
    });

    socket.on("call-accepted", async ({ from, answer }) => {
      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      toast.success("Call Accepted by user " + from, {
        duration: 3000,
      });
    });

    socket.on("call-rejected", ({ from }) => {
      toast.error("Call rejected by user " + from, {
        duration: 3000,
      });
      cleanupCall();
    });

    socket.on("collaborators-update", ({ collaborators }) => {
      // Filter out host (first user)
      const others = collaborators.slice(1);
      setCollaborators(others);
    });

    const onCallEnded = () => {
      setEndCall(true);
      rejectCall(); // cleanup kar lo
    };

    socket.on("call-ended", onCallEnded);

    socket.on("ice-candidate", async (candidate) => {
      if (candidate) {
        try {
          await peerConnection.current?.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      }
    });

    // Clean up listeners on unmount
    return () => {
      socket.off("role-assigned");
      socket.off("your-name");
      socket.off("treeStructure");
      socket.off("fileOpened");
      socket.off("fileUpdated");
      socket.off("request-file");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("ice-candidate");
    };
  }, [sessionId, findFileNode, rejectCall]);

  //handler for mic permission
  const checkMicPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      return result.state; // 'granted', 'prompt', or 'denied'
    } catch (err) {
      console.error("Permission check failed", err);
      return "prompt"; // fallback to prompt
    }
  };

  //handler for making call
  const makeCall = async (toSocketId: string) => {
    // Check mic permission before trying to access the mic
    const micPermission = await checkMicPermission();

    if (micPermission === "denied") {
      //  User has blocked mic — show your custom UI
      toast.error(
        "Microphone access is blocked. Please allow it in site settings."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        await localAudioRef.current
          .play()
          .catch((e) => console.warn("Local audio autoplay failed:", e));
      }

      const pc = createPeerConnection(toSocketId);
      peerConnection.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit("call-user", {
        to: toSocketId,
        from: socketRef.current?.id,
        offer,
      });
    } catch (err) {
      console.error("Failed to get microphone access:", err);
      toast.error("Microphone permission is required to make calls.");
    }
  };

  //handler responsible for answering call
  const acceptCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
      localAudioRef.current
        .play()
        .catch((e) => console.warn("Local audio autoplay failed:", e));
    }

    const pc = createPeerConnection(caller!);
    peerConnection.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer!));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current?.emit("accept-call", {
      to: caller,
      from: socketRef.current?.id,
      answer,
    });

    setCallAccepted(true);
  };

  const cleanupCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setCaller(null);
    setIncomingOffer(null);
    setCallAccepted(false);
  };

  //handler responsible for directory selection dialog box
  const FolderOpen = async () => {
    try {
      const dirHandle = await (
        window as Window & {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();

      const rootName = dirHandle.name;
      const children = await readDirectoryWithContent(dirHandle, "", rootName);
      const structure: TreeNode[] = [
        { type: "folder", name: rootName, path: rootName, children },
      ];
      fullTreeRef.current = structure;
      setTreeStructure(structure);

      const stripHandles = (tree: TreeNode[]): Omit<TreeNode, "handle">[] =>
        tree.map(({ children, ...rest }) => ({
          ...rest,
          ...(children ? { children: stripHandles(children) } : {}),
        }));

      socketRef.current?.emit("folder-structure", {
        structure: stripHandles(structure),
        sessionId,
        expanded: true,
      });
    } catch (err) {
      const e = err as Error;
      toast.error(
        `Directory selection cancelled. Please choose a folder to proceed`
      );
    }
  };

  // A map to store the file system entries by path (for reference or caching)
  const handleMap = new Map<string, FileSystemHandle>();

  // Type guard to check if it's a Directory Handle
  function isDirectory(
    handle: FileSystemHandle
  ): handle is FileSystemDirectoryHandle {
    return "getDirectoryHandle" in handle;
  }

  // Type guard to check if it's a File Handle
  function isFile(handle: FileSystemHandle): handle is FileSystemFileHandle {
    return "createWritable" in handle;
  }

  // Function to read a directory's contents recursively
  const readDirectoryWithContent = async (
    handle: FileSystemDirectoryHandle,
    currentPath = "",
    rootName = ""
  ): Promise<TreeNode[]> => {
    const tree: TreeNode[] = [];

    for await (const entry of handle.values()) {
      const name = entry.name;
      const relativePath = currentPath ? `${currentPath}/${name}` : name;
      const fullPath = `${rootName}/${relativePath}`;

      handleMap.set(fullPath, entry);

      if (isDirectory(entry)) {
        try {
          // Cast to our custom type that includes requestPermission
          const handleWithPermission = entry as FileSystemHandleWithPermission;

          // Safely check and call requestPermission if available
          const permission =
            typeof handleWithPermission.requestPermission === "function"
              ? await handleWithPermission.requestPermission({ mode: "read" })
              : "granted";

          if (permission === "granted") {
            const children = await readDirectoryWithContent(
              entry,
              relativePath,
              rootName
            );
            tree.push({ type: "folder", name, path: fullPath, children });
          } else {
            console.log(`Permission denied for directory: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error accessing directory ${fullPath}:`, error);
        }
      } else if (isFile(entry)) {
        tree.push({ type: "file", name, path: fullPath, handle: entry });
      }
    }
    return tree;
  };

  //handler responsible for reading file
  const openFile = (file: OpenFile) => {
    if (isHost) {
      const localFileNode = findFileNode(fullTreeRef.current, file.path);
      if (localFileNode?.handle) {
        setOpenFiles((prev) =>
          prev.find((f) => f.path === file.path) ? prev : [...prev, file]
        );
        setActiveFile(file);
        socketRef.current?.emit("fileOpened", { file, sessionId });
      }
    } else {
      socketRef.current?.emit("request-file", { path: file.path, sessionId });
    }
  };

  //handler responsible for update file content
  const updateFileContent = (updatedFile: OpenFile) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.path === updatedFile.path ? updatedFile : f))
    );
    setActiveFile(updatedFile);
    socketRef.current?.emit("fileUpdated", { file: updatedFile, sessionId });
  };

  //handler responsible for closing file
  const closeFile = (file: OpenFile) => {
    setOpenFiles((prev) => prev.filter((f) => f.path !== file.path));
    if (activeFile?.path === file.path) {
      const remaining = openFiles.filter((f) => f.path !== file.path);
      setActiveFile(
        remaining[0] || { name: "untitled", path: "untitled", content: "" }
      );
    }
  };
  return (
    <div className="h-screen flex flex-col relative">
      <Navbar
        onChatClick={() => setActivePanel("Chat")}
        onVoiceClick={() => setActivePanel("Voice")}
        onCollaboratorClick={() => setActivePanel("Collaborators")}
        onAiHelpClick={() => setActivePanel("AI")}
      />

      {activePanel === "Chat" && (
        <ChatSidebar
          onClose={() => setActivePanel(null)}
          messages={messages}
          setMessages={setMessages}
          socket={socketRef.current}
          sessionId={sessionId}
        />
      )}

      {activePanel === "Collaborators" && (
        <CollaboratorSidebar
          onClose={() => setActivePanel(null)}
          collaborators={collaborators}
        />
      )}

      {activePanel === "Voice" && (
        <VoiceSidebar
          onClose={() => setActivePanel(null)}
          makeCall={makeCall}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
          caller={caller}
          callAccepted={callAccepted}
          localAudioRef={localAudioRef}
          remoteAudioRef={remoteAudioRef}
          userName={userName}
          socketId={socketRef.current?.id}
          socket={socketRef.current}
          endCall={endCall}
          checkMicPermission={checkMicPermission}
        />
      )}

      {activePanel === "AI" && (
        <AiHelpSidebar onClose={() => setActivePanel(null)} />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessionId={sessionId}
          openFile={openFile}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          treeStructure={treeStructure}
          isRootExpanded={isRootExpanded}
          toggleRootFolder={() => setIsRootExpanded((prev) => !prev)}
          FolderOpen={FolderOpen}
          socket={socketRef.current}
          isHost={isHost}
          handleMap={handleMap}
        />
        <CodeEditor
          openFiles={openFiles}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          updateFileContent={updateFileContent}
          closeFile={closeFile}
        />
      </div>
    </div>
  );
};

export default Index;
