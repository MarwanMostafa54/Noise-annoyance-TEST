import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';

export const VerificationPage = () => {
  const { generateAndSendOtp, verifyOtp } = useAppStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isFormValid = name.trim() !== '' && email.trim() !== '';

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fill in both name and email.');
      return;
    }
    
    setIsSending(true);
    setError('');
    setMessage('');
    
    const success = await generateAndSendOtp(name, email);
    
    if (success) {
      setIsCodeSent(true);
      setMessage('Access code request sent to admin. Please await their response.');
    } else {
      setError('Failed to send request. Please try again.');
    }
    setIsSending(false);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    const success = verifyOtp(enteredOtp);
    
    if (!success) {
      setError('Invalid code. Please try again.');
      setIsVerifying(false);
    }
    // On success, the store's `isVerified` state will change,
    // and the main App router will automatically navigate away.
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 md:p-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Verification</h2>
        <p className="text-gray-600 mb-8">
          Please enter your details to request an access code. The code will be sent to the administrator for approval.
        </p>
        
        <form onSubmit={!isCodeSent ? handleSendCode : handleVerify}>
          {!isCodeSent ? (
            // State 1: Enter Details
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!isFormValid || isSending}
                className={`w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                  !isFormValid || isSending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-blue-500 to-green-400 hover:shadow-xl'
                }`}
              >
                {isSending ? 'Sending Request...' : 'Send Access Code'}
              </button>
            </div>
          ) : (
            // State 2: Enter OTP
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter code from admin"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full py-3 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                  isVerifying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-blue-500 to-green-400 hover:shadow-xl'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
};
