/**
 * Sends verification code via email or simulates SMS.
 * For email: Uses EmailJS if configured (set VITE_EMAILJS_* in .env)
 * For SMS: Requires backend (Twilio, etc.) - not implemented; returns false to show code in UI
 */

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function sendVerificationCode(to, code, method) {
  if (method === "email") {
    if (serviceId && templateId && publicKey) {
      try {
        const { default: emailjs } = await import("@emailjs/browser");
        await emailjs.send(serviceId, templateId, {
          to_email: to,
          message: code,
          from_name: "CrazyView",
        }, publicKey);
        return true;
      } catch (err) {
        console.warn("EmailJS send failed:", err);
        return false;
      }
    }
  }
  // SMS requires backend - not available from frontend
  return false;
}

export function isEmailSendingConfigured() {
  return !!(serviceId && templateId && publicKey);
}
