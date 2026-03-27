import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Step = 'details' | 'verify' | 'done';

export const RegisterPage: React.FC = () => {
  const { sendOtp, verifyOtpAndSignUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1 — validate & send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) { setError(error); return; }
    setStep('verify');
    startCooldown();
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(iv); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) { setError(error); return; }
    startCooldown();
    setOtp(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
  };

  // OTP input handling — auto-advance, backspace, paste
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Step 2 — verify OTP + set password
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = otp.join('');
    if (token.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    const { error } = await verifyOtpAndSignUp(email, token, password);
    setLoading(false);
    if (error) { setError(error); return; }
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Icon */}
        <div className="auth-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polyline points="4,22 14,6 24,22" stroke="#00D2BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="17" x2="20" y2="17" stroke="#00D2BE" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="14" cy="6" r="2" fill="#00D2BE"/>
          </svg>
        </div>

        <h1 className="auth-title">APEX</h1>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step === 'details' ? 'active' : 'done'}`} />
          <div className="step-line" />
          <div className={`step-dot ${step === 'verify' ? 'active' : step === 'done' ? 'done' : ''}`} />
        </div>

        {step === 'details' && (
          <>
            <p className="auth-sub">create your account</p>
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input className="auth-input" type="password" placeholder="Min. 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <input className="auth-input" type="password" placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Send Verification Code'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="auth-sub">verify your email</p>
            <p className="verify-hint">
              We sent a 6-digit code to<br />
              <strong className="verify-email">{email}</strong>
            </p>
            <form className="auth-form" onSubmit={handleVerify}>
              <div className="otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-btn" type="submit" disabled={loading || otp.join('').length < 6}>
                {loading ? <span className="btn-spinner" /> : 'Verify & Create Account'}
              </button>
            </form>
            <div className="resend-row">
              <span className="auth-switch">Didn't get it? </span>
              <button
                className={`resend-btn ${resendCooldown > 0 ? 'disabled' : ''}`}
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
            <button className="back-btn" onClick={() => { setStep('details'); setError(''); setOtp(['','','','','','']); }}>
              ← Change email
            </button>
          </>
        )}
      </div>
    </div>
  );
};
