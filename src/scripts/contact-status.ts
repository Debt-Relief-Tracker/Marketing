type Tone = 'error' | 'notice';

interface ContactStatus {
  message: string;
  tone: Tone;
}

const statuses: Record<string, ContactStatus> = {
  invalid: {
    message: 'Please fill in your name, a valid email, and a message.',
    tone: 'error',
  },
  send_failed: {
    message:
      'Something went wrong sending your message — please try again or email support@debtrelief.win.',
    tone: 'error',
  },
  log_failed: {
    message:
      "Your message was sent to our support team — no need to resend. We just hit a snag saving a copy on our end, which we're looking into.",
    tone: 'notice',
  },
};

const toneClasses: Record<Tone, string[]> = {
  error: ['bg-red-50', 'text-red-700', 'ring-red-200'],
  notice: ['bg-amber-50', 'text-amber-800', 'ring-amber-200'],
};

export function showContactStatus(): void {
  const error = new URLSearchParams(window.location.search).get('error');
  if (!error) return;

  const status = statuses[error] ?? statuses.send_failed;

  const banner = document.getElementById('form-error');
  if (!banner) return;
  banner.textContent = status.message;
  banner.classList.add(...toneClasses[status.tone]);
  banner.hidden = false;
}
