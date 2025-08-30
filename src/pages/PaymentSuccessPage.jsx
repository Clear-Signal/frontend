import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '../hooks/useFetch';

// Animation variants for the content switching
const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('No session ID found. Payment cannot be verified.');
      return;
    }

    const finalizeSubscription = async () => {
      try {
        const res = await axios.get(`http://localhost:8181/api/user/subscribe-now/finalize?session_id=${sessionId}`, {
            withCredentials: true,
        });
        setStatus('success');
        console.log("User data:", res.data);
        const updatedUser = JSON.parse(localStorage.getItem('user')) || {};
        updatedUser.data = { ...updatedUser.data, ...res.data?.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'An unexpected error occurred while activating your subscription.');
      }
    };

    // Add a small delay to prevent flickering on fast connections
    const timer = setTimeout(finalizeSubscription, 1000);
    return () => clearTimeout(timer);

  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <motion.div key="verifying" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center">
            <CgSpinner className="animate-spin text-5xl text-zinc-400" />
            <h1 className="text-2xl sm:text-3xl font-bold mt-6">Verifying Payment</h1>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">Please wait while we securely confirm your subscription with our payment provider.</p>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div key="success" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <FaCheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-6">Payment Successful!</h1>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">Welcome aboard! Your premium subscription is now active and ready to use.</p>
            <Link to="/dashboard" className="mt-8 inline-block w-full max-w-xs rounded-lg bg-zinc-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-zinc-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
              Go to Dashboard
            </Link>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div key="error" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <FaTimesCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-6">Verification Failed</h1>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">There was a problem activating your subscription. Please contact support if this issue persists.</p>
            <p className="mt-4 text-xs text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>
            <Link to="/subscription" className="mt-8 inline-block w-full max-w-xs rounded-lg bg-zinc-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-zinc-500 transition focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
              Return to Plans
            </Link>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-black)] text-white flex items-center justify-center p-4">
      <div className="text-center w-full max-w-lg p-6 sm:p-10 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}