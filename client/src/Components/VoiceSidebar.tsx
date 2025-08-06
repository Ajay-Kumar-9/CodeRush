import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { Socket } from "socket.io-client";
import { FaMicrophone, FaVolumeUp } from "react-icons/fa";
import { FaPhone } from "react-icons/fa";

interface VoiceSidebarProps {
  onClose: () => void;
  makeCall: (to: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  caller: string | null;
  callAccepted: boolean;
  localAudioRef: React.RefObject<HTMLAudioElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  userName: string;
  socketId: string | undefined;
  socket: Socket | null;
  endCall: boolean | null;
  checkMicPermission: () => Promise<string>;
}

export default function VoiceSidebar({
  onClose,
  makeCall,
  acceptCall,
  rejectCall,
  caller,
  callAccepted,
  localAudioRef,
  remoteAudioRef,
  userName,
  socketId,
  socket,
  endCall,
  checkMicPermission,
}: VoiceSidebarProps) {
  const [callToId, setCallToId] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    console.log("VoiceSidebar props update:", { caller, callAccepted });
  }, [caller, callAccepted]);

  const handleCall = async () => {
    if (!callToId || callToId === socketId) {
      toast.error("Invalid ID or can't call yourself.");
      return;
    }

    const permission = await checkMicPermission();

    if (permission === "denied" || permission === "prompt") {
      setIsCalling(false);
      toast.error(`Microphone access is required to make calls.`);
      return;
    }

    setIsCalling(true);
    toast.success(`Initiating call to: ${callToId}`, { duration: 5000 });
    makeCall(callToId);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    rejectCall();

    if (socket) {
      socket.emit("call-ended");
    }
  };

  return (
    <div className="fixed top-[55px] lg:right-0 md:right-0 sm:right-0 lg:w-[320px] md:w-[320px] sm:w-[320px] w-full h-[calc(100vh-55px)] bg-white z-50 flex flex-col rounded-bl-2xl shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-teal-600">
        <p className="text-white font-semibold text-lg">Voice Call</p>
        <RxCross2
          className="text-white cursor-pointer hover:text-red-500"
          onClick={onClose}
        />
      </div>

      <div className="p-4 text-sm text-gray-700 space-y-4">
        {caller && !callAccepted ? (
          <div>
            <p>
              Incoming call from <strong>{caller}</strong>
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={acceptCall}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (callAccepted || isCalling) && !endCall ? (
          <button
            onClick={handleEndCall}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            End Call
          </button>
        ) : (
          <>
            <input
              type="text"
              value={callToId}
              onChange={(e) => setCallToId(e.target.value)}
              placeholder="Enter Socket ID to call"
              className="border p-2 w-full rounded mb-3"
            />
            <button
              onClick={handleCall}
              className="w-full bg-green-500 text-white py-2 rounded flex justify-center items-center gap-1 "
            >
              <FaPhone size={15} /> <p>Call</p>
            </button>
          </>
        )}

        <div>
          {(callAccepted || isCalling) && !endCall && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaMicrophone className="text-green-600" />
              <span className="text-sm">Your mic is active</span>
            </div>
          )}

          <audio
            ref={localAudioRef}
            autoPlay
            muted
            style={{ display: "none" }}
          />

          {(callAccepted || isCalling) && !endCall && (
            <>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaVolumeUp className="text-blue-600" />
                <span className="text-sm">Listening to remote user</span>
              </div>

              <audio
                ref={remoteAudioRef}
                autoPlay
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-500">Your name: {userName}</p>
          <p className="text-sm text-gray-500">
            Your ID: {socketId || "Not connected"}
          </p>
        </div>
      </div>
    </div>
  );
}
