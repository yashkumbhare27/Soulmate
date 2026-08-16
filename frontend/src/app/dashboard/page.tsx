'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, X, Check, Award, MapPin, GraduationCap, Info, MessageSquare, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { SpecularLogo } from '../../components/SpecularLogo';
import { API_BASE_URL } from '../../lib/config';

export default function Dashboard() {
  const router = useRouter();
  const [feed, setFeed] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Match celebration state
  const [celebrationMatch, setCelebrationMatch] = useState<any>(null);

  // Detail Modal overlay state
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchRecommendations();
  }, [router]);

  const fetchRecommendations = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeed(data);
      } else {
        setError(data.error || 'Failed to fetch recommendations.');
      }
    } catch (err) {
      setError('Cannot load matches. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (currentIndex >= feed.length) return;
    const currentItem = feed[currentIndex];
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/matches/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateUserId: currentItem.profile.userId._id,
          action
        })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.matchCreated) {
          // Trigger match celebration!
          setCelebrationMatch({
            matchId: data.match._id,
            name: currentItem.profile.userId.name,
            photo: currentItem.profile.photos[0],
            score: currentItem.compatibilityScore
          });
        } else {
          setCurrentIndex(prev => prev + 1);
          setShowDetailModal(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentMatch = feed[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col items-center justify-center relative">
        
        {loading ? (
          /* Loading Skeleton */
          <div className="w-full max-w-sm h-[500px] glass-panel rounded-3xl p-6 flex flex-col justify-between animate-pulse">
            <div className="h-64 bg-white/5 rounded-2xl" />
            <div className="space-y-3 mt-4">
              <div className="h-6 bg-white/5 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-10 bg-white/5 rounded" />
            </div>
            <div className="flex gap-4 mt-6">
              <div className="h-12 w-full bg-white/5 rounded-xl" />
              <div className="h-12 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6 glass-panel rounded-3xl max-w-md">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-3" />
            <h3 className="font-bold text-lg">Failed to load matches</h3>
            <p className="text-sm text-neutral-light/60 mt-1">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-4 px-4 py-2 bg-brand-gradient text-xs font-semibold rounded-lg hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : currentIndex >= feed.length ? (
          /* Empty State */
          <div className="text-center p-8 glass-panel rounded-3xl max-w-md">
            <Sparkles className="h-12 w-12 text-accent-ai mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold">You've seen all recommendations</h3>
            <p className="text-sm text-neutral-light/60 mt-2">
              Our AI is constantly evaluating new matrimonial registrations. Check back soon for new profiles!
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                fetchRecommendations();
              }}
              className="mt-6 px-6 py-2.5 bg-brand-gradient text-xs font-semibold rounded-xl"
            >
              Refresh Deck
            </button>
          </div>
        ) : (
          /* Recommendation Card Deck */
          <div className="w-full max-w-md relative flex flex-col items-center">
            
            {/* Compatibility Score Header Tag */}
            <div className="absolute -top-4 z-20 px-4 py-1.5 bg-ai-gradient rounded-full shadow-lg border border-accent-ai-glow/20 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-neutral-dark" />
              <span className="text-xs font-bold text-neutral-dark">
                {currentMatch.compatibilityScore}% Compatibility
              </span>
            </div>

            {/* Profile Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="w-full glass-panel rounded-3xl overflow-hidden shadow-2xl relative border"
            >
              {/* Photo & Basic Details */}
              <div className="h-72 w-full relative bg-[#171221] overflow-hidden">
                {currentMatch.profile.photos && currentMatch.profile.photos[0] ? (
                  <img
                    src={currentMatch.profile.photos[0]}
                    alt={currentMatch.profile.userId.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-light/35 bg-neutral-dark-card font-serif text-3xl">
                    {currentMatch.profile.userId.name[0]}
                  </div>
                )}
                
                {/* Info Overlay Panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-dark to-transparent p-6 pt-12 flex flex-col justify-end">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {currentMatch.profile.userId.name}
                    </h2>
                    <span className="text-lg text-secondary font-semibold">
                      {currentMatch.profile.dateOfBirth ? Math.abs(new Date(currentMatch.profile.dateOfBirth).getFullYear() - 2026) : 28}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-neutral-light/75 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary-light" />
                      {currentMatch.profile.location.city}, {currentMatch.profile.location.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-primary-light" />
                      {currentMatch.profile.aiPreferences?.structuredPrefs?.education?.[0] || 'Graduate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Differentiator Explainability Summary */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-neutral-light/50 tracking-wider">About</h4>
                  <p className="text-xs text-neutral-light/85 mt-1 leading-relaxed">
                    {currentMatch.profile.bio || 'Matrimonial profile.'}
                  </p>
                </div>

                {/* AI Explanation - WHY they matched */}
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/15 relative overflow-hidden">
                  <div className="absolute top-2 right-2 p-1 bg-white/5 rounded-full" title="AI Matchmaker Insight">
                    <Sparkles className="h-3 w-3 text-accent-ai" />
                  </div>
                  <h4 className="text-[10px] uppercase font-bold text-primary-light tracking-wider flex items-center gap-1.5">
                    Why You Match
                  </h4>
                  <p className="text-xs text-neutral-light/90 mt-1.5 leading-relaxed font-medium">
                    {currentMatch.aiExplanation.reasoning}
                  </p>

                  <button
                    onClick={() => setShowDetailModal(true)}
                    className="mt-3 text-[10px] font-bold text-brand-gradient hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" /> View Green Flags & Red Flags
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex items-center gap-4">
                <button
                  onClick={() => handleSwipe('pass')}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-neutral-light hover:bg-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" /> Pass
                </button>
                <button
                  onClick={() => handleSwipe('like')}
                  className="flex-1 py-3 bg-brand-gradient text-neutral-light rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors hover:opacity-90 cursor-pointer shadow-lg shadow-primary/25"
                >
                  <Heart className="h-4 w-4" /> Connect
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </main>

      {/* Detail Explanation Overlay Modal */}
      <AnimatePresence>
        {showDetailModal && currentMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl relative border max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-neutral-light/50 hover:text-neutral-light cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent-ai" />
                <h3 className="text-lg font-bold">AI Compatibility Insight</h3>
              </div>

              <div className="space-y-4">
                {/* Reasoning summary */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="text-[10px] uppercase font-bold text-[#E8A0BF] tracking-wider">Analysis</h4>
                  <p className="text-xs text-neutral-light/95 mt-1.5 leading-relaxed">
                    {currentMatch.aiExplanation.reasoning}
                  </p>
                </div>

                {/* Green flags (compatibilities) */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-success tracking-wider block mb-2">Green Flags</h4>
                  <div className="space-y-2">
                    {currentMatch.aiExplanation.greenFlags?.map((flag: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-success/10 border border-success/15 text-xs text-success-light flex gap-2">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Red flags (frictions) */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-error tracking-wider block mb-2">Points of Consideration</h4>
                  <div className="space-y-2">
                    {currentMatch.aiExplanation.redFlags?.map((flag: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-error/10 border border-error/15 text-xs text-error-light flex gap-2">
                        <X className="h-3.5 w-3.5 text-error shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared interests */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#8B5FBF] tracking-wider block mb-2">Shared Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.aiExplanation.sharedInterests?.map((interest: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs text-primary-light font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Celebration Overlay Modal */}
      <AnimatePresence>
        {celebrationMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F0B13]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Glowing nodes overlay behind */}
            <div className="absolute w-96 h-96 bg-brand-gradient rounded-full blur-[120px] opacity-25" />

            <div className="max-w-md w-full p-8 rounded-3xl relative z-10 flex flex-col items-center">
              
              {/* Animating logo ribbons together */}
              <motion.div
                initial={{ rotate: -180, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 60 }}
                className="mb-8"
              >
                <SpecularLogo size={140} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold tracking-tight text-brand-gradient"
              >
                It is a Match!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-neutral-light/75 mt-3 max-w-xs leading-relaxed"
              >
                You and <span className="font-bold text-[#E8A0BF]">{celebrationMatch.name}</span> have mutual AI matching signals!
              </motion.p>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 w-full"
              >
                {celebrationMatch.photo && (
                  <img
                    src={celebrationMatch.photo}
                    alt={celebrationMatch.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E8A0BF]"
                  />
                )}
                <div className="text-left">
                  <h4 className="font-bold text-sm">{celebrationMatch.name}</h4>
                  <div className="px-2.5 py-0.5 mt-1 bg-ai-gradient rounded-full inline-block text-[10px] font-bold text-neutral-dark">
                    {celebrationMatch.score}% Compatibility
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8 flex flex-col gap-3 w-full"
              >
                <button
                  onClick={() => {
                    const id = celebrationMatch.matchId;
                    setCelebrationMatch(null);
                    router.push('/chat');
                  }}
                  className="w-full py-3.5 rounded-xl bg-brand-gradient font-bold flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg"
                >
                  <MessageSquare className="h-4 w-4" /> Start Matrimonial Chat
                </button>
                
                <button
                  onClick={() => {
                    setCelebrationMatch(null);
                    setCurrentIndex(prev => prev + 1);
                    setShowDetailModal(false);
                  }}
                  className="w-full text-xs text-neutral-light/50 hover:text-neutral-light transition-colors py-2"
                >
                  Keep Browsing
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
