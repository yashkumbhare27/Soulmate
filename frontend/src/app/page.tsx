'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SpecularLogo } from '../components/SpecularLogo';
import { ArrowRight, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

export default function Home() {
  const router = useRouter();
  
  // Animation states
  const [animationStep, setAnimationStep] = useState<'splash' | 'tagline' | 'login'>('splash');
  
  // Auth Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New User signup fields (shown if needsRegistration is returned)
  const [needsReg, setNeedsReg] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');

  // Trigger intro sequence on first load
  useEffect(() => {
    const isReturning = localStorage.getItem('hasSeenSplash');
    
    if (isReturning) {
      setAnimationStep('login');
      return;
    }

    // Splash animation timer
    const splashTimer = setTimeout(() => {
      setAnimationStep('tagline');
    }, 2200);

    const loginTimer = setTimeout(() => {
      setAnimationStep('login');
      localStorage.setItem('hasSeenSplash', 'true');
    }, 4500);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(loginTimer);
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
      } else {
        setError(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setError('Cannot connect to backend server. Ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        phoneNumber,
        otp,
        email,
        name,
        gender,
        city,
        state: stateName
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      if (data.needsRegistration) {
        setNeedsReg(true);
        setIsOtpSent(true);
        setOtp('123456'); // pre-fill OTP for easy registration path
        setLoading(false);
        return;
      }

      // Store auth session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.isNewUser) {
        router.push('/profile');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const skipAnimation = () => {
    setAnimationStep('login');
    localStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-neutral-dark text-neutral-light overflow-hidden">
      
      {/* Background radial soft lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />

      {/* Skip Intro button */}
      {animationStep !== 'login' && (
        <button
          onClick={skipAnimation}
          className="absolute top-6 right-6 px-4 py-1.5 glass-panel rounded-full text-xs font-semibold hover:bg-white/10 transition-colors uppercase tracking-wider cursor-pointer z-50"
        >
          Skip Intro
        </button>
      )}

      <AnimatePresence mode="wait">
        
        {/* Step 1: Splash Screen Logo Merge */}
        {animationStep === 'splash' && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center"
          >
            <SpecularLogo size={180} />
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-2xl font-light tracking-widest text-[#E8A0BF]/80"
            >
              SOULMATE AI
            </motion.h2>
          </motion.div>
        )}

        {/* Step 2: Tagline Reveal */}
        {animationStep === 'tagline' && (
          <motion.div
            key="tagline-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center px-6"
          >
            <SpecularLogo size={100} className="mb-6" />
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-serif text-neutral-light font-bold max-w-2xl leading-tight"
            >
              Find Your Perfect Soulmate with AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-base tracking-wide text-brand-gradient font-medium italic"
            >
              "The only matchmaking AI that tells you why."
            </motion.p>
          </motion.div>
        )}

        {/* Step 3: Login Panel */}
        {animationStep === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="w-full max-w-md px-6 z-10"
          >
            <div className="glass-panel p-8 rounded-3xl border shadow-2xl relative">
              <div className="flex flex-col items-center mb-6">
                <SpecularLogo size={70} className="mb-2" />
                <h2 className="text-2xl font-bold tracking-tight text-brand-gradient">
                  Welcome to SoulMate AI
                </h2>
                <p className="text-xs text-neutral-light/60 mt-1">
                  AI-Powered Premium Matrimonials
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/15 text-error text-xs border border-error/20">
                  {error}
                </div>
              )}

              {!isOtpSent ? (
                /* Step A: Phone Submission */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-2">
                      Enter Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-light/40" />
                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none focus:border-primary/50 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-gradient font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Sending...' : 'Get OTP Code'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : needsReg ? (
                /* Step B: New User Registration Fields */
                <form onSubmit={handleVerifyOtp} className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  <div className="p-3 rounded bg-primary/10 border border-primary/20 text-xs text-primary-light mb-2">
                    Creating an account for: <span className="font-bold">{phoneNumber}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-light/40" />
                      <input
                        type="text"
                        placeholder="E.g., Devendra Patil"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none focus:border-primary/50 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-light/40" />
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none focus:border-primary/50 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#171221] border border-white/10 text-neutral-light focus:outline-none focus:border-primary/50 text-sm"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        defaultValue="1998-01-01"
                        onChange={(e) => {}}
                        className="w-full px-3 py-2 rounded-xl bg-[#171221] border border-white/10 text-neutral-light focus:outline-none focus:border-primary/50 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-gradient font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer text-sm mt-4"
                  >
                    {loading ? 'Creating...' : 'Register and Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                /* Step C: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-light/75 uppercase tracking-wider mb-2">
                      Enter OTP Code
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-light/40" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-light placeholder-white/35 focus:outline-none focus:border-primary/50 text-sm transition-all tracking-widest text-center font-bold"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-primary-light mt-1.5 block text-center">
                      (Simulated code: enter 123456)
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-gradient font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Verifying...' : 'Verify & Log In'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="w-full text-center text-xs text-neutral-light/50 hover:text-neutral-light transition-colors mt-2"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
