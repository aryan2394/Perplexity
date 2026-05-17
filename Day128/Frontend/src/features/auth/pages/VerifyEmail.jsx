import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { verifyEmail } from '../service/auth.api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur text-center">
          
          {status === 'loading' && (
            <div className="animate-pulse">
              <h1 className="text-2xl font-bold text-[#31b8c6] mb-4">Verifying Email</h1>
              <p className="text-zinc-300">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-500 mb-4">Verified!</h1>
              <p className="text-zinc-300">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-500 mb-4">Verification Failed</h1>
              <p className="text-zinc-300 mb-6">{message}</p>
              <Link to="/register" className="text-[#31b8c6] hover:underline">
                Back to Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
