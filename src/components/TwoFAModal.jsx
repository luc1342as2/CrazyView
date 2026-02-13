import { useState, useEffect } from "react";
import { sendVerificationCode, isEmailSendingConfigured } from "../utils/sendVerificationCode";
import "./TwoFAModal.css";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function Enable2FAModal({ onClose, onSuccess, accountEmail, accountPhone }) {
  const hasEmail = !!accountEmail?.trim();
  const hasPhone = !!accountPhone?.trim();
  const defaultMethod = hasEmail ? "email" : hasPhone ? "phone" : "email";
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(defaultMethod);
  const [code, setCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const targetValue = (method === "email" ? accountEmail : accountPhone)?.trim?.() || "";

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    if (!targetValue) {
      setError(hasPhone ? "Select phone to receive the code." : "Add a phone number in Account settings.");
      if (hasEmail) setMethod("email");
      if (hasPhone) setMethod("phone");
      return;
    }
    setSending(true);
    const newCode = generateCode();
    setCode(newCode);

    const sent = await sendVerificationCode(targetValue, newCode, method);
    setEmailSent(sent && method === "email");
    setSending(false);
    setStep(2);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError("");
    if (enteredCode !== code) {
      setError("Invalid code. Please try again.");
      return;
    }
    onSuccess({ method, value: targetValue?.trim() });
  };

  const handleResend = async () => {
    const newCode = generateCode();
    setCode(newCode);
    setEnteredCode("");
    setError("");
    setSending(true);
    const sent = await sendVerificationCode(targetValue, newCode, method);
    setEmailSent(sent && method === "email");
    setSending(false);
  };

  return (
    <div className="twofa-modal-overlay" onClick={onClose}>
      <div className="twofa-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Enable Two-Factor Authentication</h3>
        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <p className="twofa-description">
              We'll send a verification code directly to your account's email or phone number.
            </p>
            {(hasEmail || hasPhone) && (
              <div className="twofa-contact-options">
                {hasEmail && (
                  <label className="twofa-radio twofa-contact-option">
                    <input type="radio" name="method" value="email" checked={method === "email"} onChange={() => setMethod("email")} />
                    <span>Email: {accountEmail}</span>
                  </label>
                )}
                {hasPhone && (
                  <label className="twofa-radio twofa-contact-option">
                    <input type="radio" name="method" value="phone" checked={method === "phone"} onChange={() => setMethod("phone")} />
                    <span>Phone: {accountPhone}</span>
                  </label>
                )}
              </div>
            )}
            {hasEmail && !hasPhone && (
              <p className="twofa-hint">Code will be sent to {accountEmail}</p>
            )}
            {hasPhone && !hasEmail && (
              <p className="twofa-hint">Code will be sent to {accountPhone}</p>
            )}
            {hasEmail && hasPhone && (
              <p className="twofa-hint">Code will be sent to {method === "email" ? accountEmail : accountPhone}</p>
            )}
            {error && <p className="twofa-error">{error}</p>}
            <div className="twofa-buttons">
              <button type="submit" className="twofa-btn-primary" disabled={sending}>
                {sending ? "Sending..." : "Send code"}
              </button>
              <button type="button" className="twofa-btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <p className="twofa-description">
              We've sent a 6-digit code to {targetValue}.
            </p>
            {(method === "email" && isEmailSendingConfigured() && emailSent) ? (
              <p className="twofa-success">Code sent! Check your inbox (and spam folder).</p>
            ) : (
              <p className="twofa-demo-hint">
                {method === "phone"
                  ? "SMS requires a backend. Your code is "
                  : "If you didn't receive it, your code is "}
                <strong>{code}</strong>
              </p>
            )}
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="twofa-input twofa-code-input"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {error && <p className="twofa-error">{error}</p>}
            <button type="button" className="twofa-resend" onClick={handleResend}>
              Resend code
            </button>
            <div className="twofa-buttons">
              <button type="submit" className="twofa-btn-primary">Verify</button>
              <button type="button" className="twofa-btn-secondary" onClick={() => setStep(1)}>Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Disable2FAModal({ onClose, onSuccess, onVerifyPassword, twoFAValue, twoFAMethod = "email" }) {
  const [verifyMethod, setVerifyMethod] = useState("code");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const sendCodeToContact = async () => {
    const newCode = generateCode();
    setSentCode(newCode);
    setCode("");
    setError("");
    const sent = await sendVerificationCode(twoFAValue, newCode, twoFAMethod);
    setEmailSent(sent && twoFAMethod === "email");
  };

  const handleResendCode = async () => {
    await sendCodeToContact();
  };

  useEffect(() => {
    if (twoFAValue) sendCodeToContact();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (verifyMethod === "code") {
      if (code !== sentCode) {
        setError("Invalid code. Please try again.");
        return;
      }
    } else {
      if (!onVerifyPassword?.(password)) {
        setError("Incorrect password.");
        return;
      }
    }
    onSuccess();
  };

  return (
    <div className="twofa-modal-overlay" onClick={onClose}>
      <div className="twofa-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Disable Two-Factor Authentication</h3>
        <p className="twofa-description">
          Verify your identity to turn off 2FA. Use the code sent to {twoFAValue} or your account password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="twofa-method-select">
            <label className="twofa-radio">
              <input type="radio" name="disableMethod" checked={verifyMethod === "code"} onChange={() => setVerifyMethod("code")} />
              <span>Verification code</span>
            </label>
            <label className="twofa-radio">
              <input type="radio" name="disableMethod" checked={verifyMethod === "password"} onChange={() => setVerifyMethod("password")} />
              <span>Account password</span>
            </label>
          </div>
          {verifyMethod === "code" ? (
            <>
              {(twoFAMethod === "email" && isEmailSendingConfigured() && emailSent) ? (
                <p className="twofa-success">Code sent to {twoFAValue}! Check your inbox.</p>
              ) : (
                <p className="twofa-demo-hint">
                  {twoFAMethod === "phone" ? "SMS requires backend. Your code is " : "If you didn't receive it, your code is "}
                  <strong>{sentCode}</strong>
                </p>
              )}
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="twofa-input twofa-code-input"
                maxLength={6}
              />
              <button type="button" className="twofa-resend" onClick={handleResendCode}>
                Resend code
              </button>
            </>
          ) : (
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="twofa-input"
            />
          )}
          {error && <p className="twofa-error">{error}</p>}
          <div className="twofa-buttons">
            <button type="submit" className="twofa-btn-primary">Verify & Disable</button>
            <button type="button" className="twofa-btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Verify2FACodeModal({ onClose, onSuccess, twoFAValue, twoFAMethod = "email" }) {
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const sendCode = async () => {
    const newCode = generateCode();
    setSentCode(newCode);
    setCode("");
    setError("");
    const sent = await sendVerificationCode(twoFAValue, newCode, twoFAMethod);
    setEmailSent(sent && twoFAMethod === "email");
  };

  useEffect(() => {
    sendCode();
  }, []);

  const handleResend = async () => {
    await sendCode();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (code !== sentCode) {
      setError("Invalid code. Please try again.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="twofa-modal-overlay" onClick={onClose}>
      <div className="twofa-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Verify your identity</h3>
        <p className="twofa-description">
          We've sent a 6-digit code to {twoFAValue}. Enter it below to continue.
        </p>
        {(twoFAMethod === "email" && isEmailSendingConfigured() && emailSent) ? (
          <p className="twofa-success">Code sent! Check your inbox (and spam folder).</p>
        ) : sentCode ? (
          <p className="twofa-demo-hint">
            {twoFAMethod === "phone" ? "SMS requires backend. Your code is " : "If you didn't receive it, your code is "}
            <strong>{sentCode}</strong>
          </p>
        ) : null}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="twofa-input twofa-code-input"
            maxLength={6}
          />
          {error && <p className="twofa-error">{error}</p>}
          <button type="button" className="twofa-resend" onClick={handleResend}>
            Resend code
          </button>
          <div className="twofa-buttons">
            <button type="submit" className="twofa-btn-primary">Verify</button>
            <button type="button" className="twofa-btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
