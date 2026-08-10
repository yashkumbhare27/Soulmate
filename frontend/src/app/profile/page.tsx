'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, CheckCircle, ArrowRight, UserPlus, Compass } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ProfileOnboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [structuredPrefs, setStructuredPrefs] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize preference chat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Load initial greeting
    setMessages([
      {
        role: 'assistant',
        content: "Namaste! I am your SoulMate AI match specialist. I am here to understand who you are looking for in a relationship. To get started, could you share your preferred age range for a partner?"
      }
    ]);
  }, [router]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const token = localStorage.getItem('token');
    const userMsg = inputValue;
    setInputValue('');
    setLoading(true);

    const updatedMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(updatedMessages);

    try {
      const res = await fetch('http://localhost:5000/api/profile/pref-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.isComplete) {
          setIsComplete(true);
          setStructuredPrefs(data.structuredPrefs);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Conversational AI Window */}
        <div className={`col-span-12 ${isComplete ? 'md:col-span-6' : 'md:col-span-12'} flex flex-col h-[70vh] glass-panel rounded-3xl overflow-hidden transition-all duration-500`}>
          
          {/* AI Header */}
          <div className="bg-[#171221] px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-ai-gradient">
                <Sparkles className="h-4 w-4 text-neutral-dark" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Preference Specialist</h3>
                <p className="text-[10px] text-neutral-light/50">Onboarding conversational agent</p>
              </div>
            </div>
            {isComplete && (
              <span className="px-2 py-1 bg-success/20 text-success text-[10px] rounded-full font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Preferences Analyzed
              </span>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-gradient text-neutral-light rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-neutral-light/90 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-light/40 rounded-bl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-secondary animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                  Analyzing preferences...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          {!isComplete && (
            <form onSubmit={handleSendMessage} className="p-4 bg-[#171221] border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your description..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 text-neutral-light placeholder-white/30"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="p-2.5 rounded-xl bg-brand-gradient flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

        </div>

        {/* Right Column: AI Extracted Details Dashboard (Revealed when complete) */}
        {isComplete && structuredPrefs && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60 }}
            className="col-span-12 md:col-span-6 flex flex-col glass-panel rounded-3xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Compass className="h-5 w-5 text-accent-ai" />
              <h3 className="text-lg font-bold">Extracted Preferences</h3>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider">Age Preference</span>
                <p className="text-base font-semibold mt-1">
                  {structuredPrefs.ageMin} to {structuredPrefs.ageMax} Years Old
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider block mb-2">Core Matrimonial Values</span>
                <div className="flex flex-wrap gap-2">
                  {structuredPrefs.values?.map((val: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-medium text-primary-light">
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider block mb-2">Lifestyle Alignment</span>
                <div className="flex flex-wrap gap-2">
                  {structuredPrefs.lifestyle?.map((l: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-xs font-medium text-secondary">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider block mb-2">Target Locations</span>
                <div className="flex flex-wrap gap-2">
                  {structuredPrefs.locationPrefs?.map((loc: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-light/80">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider block mb-2">Educational Preferences</span>
                <div className="flex flex-wrap gap-2">
                  {structuredPrefs.education?.map((edu: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-light/80">
                      {edu}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="mt-6 w-full py-3.5 rounded-xl bg-brand-gradient font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shadow-lg text-sm"
            >
              Confirm and Search Soulmates
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
}
