import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-black)] text-white flex items-center justify-center">
      <div className="text-center p-8 bg-zinc-900 rounded-lg shadow-xl max-w-md w-full">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto" />
        <h1 className="text-3xl font-semibold mt-4">Payment Canceled</h1>
        <p className="text-gray-400 mt-2">Your transaction was not completed. You have not been charged.</p>
        <div className="mt-8 flex justify-center gap-4">
            <Link to="/subscription" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">
                Try Again
            </Link>
            <Link to="/" className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">
                Go to Homepage
            </Link>
        </div>
      </div>
    </div>
  );
}