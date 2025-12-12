import React, { useRef, useEffect, useState } from 'react';

export interface Participant {
  userId: string;
  userName: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

export interface VideoCallModalProps {
  roomId: string;
  isOpen: boolean;
  participants: Participant[];
  localStream?: MediaStream;
  currentUserId: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onLeaveCall: () => void;
  className?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  roomId,
  isOpen,
  participants,
  localStream,
  currentUserId,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onClose,
  onToggleMute,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onLeaveCall,
  className = '',
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold">Video Call</h2>
          <p className="text-gray-400 text-sm">{participants.length + 1} participants</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
            className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {layout === 'grid' ? 'Speaker View' : 'Grid View'}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          className={`grid gap-4 h-full ${
            layout === 'grid'
              ? participants.length > 4
                ? 'grid-cols-3'
                : participants.length > 1
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              : 'grid-cols-1'
          }`}
        >
          {/* Local video */}
          <VideoTile
            participant={{
              userId: currentUserId,
              userName: 'You',
              stream: localStream,
              isMuted,
              isVideoOff,
              isScreenSharing,
              isSpeaking: false,
            }}
            isLocal
            videoRef={localVideoRef}
          />

          {/* Remote videos */}
          {participants.map((participant) => (
            <VideoTile
              key={participant.userId}
              participant={participant}
              isLocal={false}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={onToggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>

        <button
          onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenSharing
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </button>

        <button
          onClick={onLeaveCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors ml-4"
          title="Leave call"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface VideoTileProps {
  participant: Participant;
  isLocal: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoTile: React.FC<VideoTileProps> = ({ participant, isLocal, videoRef }) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ref = isLocal ? videoRef : remoteVideoRef;
    if (ref?.current && participant.stream) {
      ref.current.srcObject = participant.stream;
    }
  }, [participant.stream, isLocal, videoRef]);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden ${
        participant.isSpeaking ? 'ring-4 ring-green-500' : ''
      }`}
    >
      {/* Video */}
      {!participant.isVideoOff ? (
        <video
          ref={isLocal ? videoRef : remoteVideoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-4xl font-semibold text-white">
              {participant.userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{participant.userName}</span>
            {participant.isScreenSharing && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded">
                Screen sharing
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {participant.isMuted && (
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
