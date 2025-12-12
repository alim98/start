'use client';

import { useState } from 'react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function EmailCaptureModal({ isOpen, onClose, onSubmit }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      onSubmit(email);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!submitted ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              گزارش کامل می‌خواهید؟
            </h2>
            <p className="text-slate-600 mb-6">
              ایمیل خود را وارد کنید تا این ارزیابی ذخیره شود و زمانی که گزارش تحلیلی ۳ صفحه‌ای راه‌اندازی شد، به شما اطلاع دهیم.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="لطفا یک آدرس ایمیل معتبر وارد کنید"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left text-slate-900"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                ذخیره و اطلاع‌رسانی
              </button>

              <p className="text-xs text-slate-500 text-center">
                ما فقط برای ارسال این گزارش از ایمیل شما استفاده می‌کنیم. بدون هرزنامه.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              همه چیز آماده است!
            </h3>
            <p className="text-slate-600">
              زمانی که گزارش تفصیلی آماده شد، برای شما ایمیل می‌فرستیم.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
