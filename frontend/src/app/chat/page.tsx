'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { Send, Sparkles, Clock, MapPin, CheckSquare, RefreshCw, MessageSquare } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

interface ChatRoom {
  matchId: string;
  compatibilityScore: number;
  chatWindowExpiry: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
  };
  otherProfile: {
    photos: string[];
    bio: string;
  };
}

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userId, setUserId] = useState<string>('');
  
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Countdown timer string
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/');
      return;
    }

    const user = JSON.parse(userStr);
    setUserId(user.id);

    // Fetch rooms list
    fetchRooms();

    // Setup Socket
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('receive_message', (message: Message) => {
      // If message is for the currently open room, append it
      setMessages(prev => {
        // Prevent duplicate appending
        if (prev.some(m => m.id === message.id)) return prev;
        if (message.matchId === socketRef.current?.activeMatchId) {
          return [...prev, message];
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [router]);

  // Handle active room countdown calculations
  useEffect(() => {
    if (!activeRoom) return;

    const interval = setInterval(() => {
      const expiry = new Date(activeRoom.chatWindowExpiry).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdownText('Expired');
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`${days}d ${hours}h ${minutes}m left`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  // Keep ref updated with open room ID for socket receive callback filter
  useEffect(() => {
    if (socketRef.current && activeRoom) {
      socketRef.current.activeMatchId = activeRoom.matchId;
    }
  }, [activeRoom]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/matches/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data);
        if (data.length > 0 && !activeRoom) {
          selectRoom(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    setActiveRoom(room);
    setMessages([]);
    
    // Join Socket Room
    if (socketRef.current) {
      socketRef.current.emit('join_room', { matchId: room.matchId });
    }

    // Fetch Chat History
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${room.matchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeRoom || !socketRef.current) return;

    const payload = {
      matchId: activeRoom.matchId,
      senderId: userId,
      text: inputValue
    };

    // Emit message to Socket server
    socketRef.current.emit('send_message', payload);
    setInputValue('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-12 gap-6">
        
        {/* Left Column: Matches Sidebar list */}
        <div className="col-span-12 md:col-span-4 flex flex-col glass-panel rounded-3xl overflow-hidden h-[75vh]">
          <div className="px-6 py-4 bg-[#171221] border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-sm">Active Matrimonial Chats</h3>
            <button onClick={fetchRooms} className="p-1 hover:bg-white/5 rounded">
              <RefreshCw className="h-4 w-4 text-neutral-light/50 hover:text-neutral-light" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {rooms.length === 0 ? (
              <div className="text-center py-12 text-neutral-light/30 text-xs">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No active connections. Go to the dashboard and connect with recommended matches!
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = activeRoom?.matchId === room.matchId;
                return (
                  <button
                    key={room.matchId}
                    onClick={() => selectRoom(room)}
                    className={`w-full p-3 rounded-2xl border text-left transition-colors flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-primary/20 border-primary'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {room.otherProfile?.photos?.[0] ? (
                      <img
                        src={room.otherProfile.photos[0]}
                        alt={room.otherUser.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-neutral-dark-card flex items-center justify-center font-bold text-sm shrink-0">
                        {room.otherUser.name[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs truncate">{room.otherUser.name}</h4>
                        <span className="px-1.5 py-0.5 bg-ai-gradient rounded text-[8px] font-bold text-neutral-dark shrink-0">
                          {room.compatibilityScore}%
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-light/50 truncate mt-1">
                        {room.otherProfile?.bio || 'Click to view conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="col-span-12 md:col-span-8 flex flex-col glass-panel rounded-3xl overflow-hidden h-[75vh]">
          {activeRoom ? (
            <>
              {/* Header with Countdown HUD */}
              <div className="bg-[#171221] px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  {activeRoom.otherProfile?.photos?.[0] && (
                    <img
                      src={activeRoom.otherProfile.photos[0]}
                      alt={activeRoom.otherUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E8A0BF]/30"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">{activeRoom.otherUser.name}</h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#E8A0BF] font-semibold tracking-wider">
                      <Sparkles className="h-3 w-3 text-accent-ai" />
                      <span>{activeRoom.compatibilityScore}% Compatibility Insight</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Countdown Timer */}
                <div className="px-3 py-1.5 bg-[#EF4444]/15 border border-[#EF4444]/25 rounded-xl flex items-center gap-1.5 text-xs text-[#EF4444] font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{countdownText}</span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-neutral-light/30 text-xs">
                    Start of matrimonial conversation. Keep it respectful!
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-brand-gradient text-neutral-light rounded-br-none'
                              : 'bg-white/5 border border-white/10 text-neutral-light/95 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span className="text-[8px] text-neutral-light/40 block text-right mt-1.5">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#171221] border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Send message to ${activeRoom.otherUser.name}...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 text-neutral-light placeholder-white/30"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-5 py-3 rounded-xl bg-brand-gradient font-bold flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer text-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-light/30 text-xs p-6">
              <MessageSquare className="h-12 w-12 text-primary opacity-50 mb-3" />
              Select a conversation to start chatting.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
