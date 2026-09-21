export function showContactStatus(): void {
  const error = new URLSearchParams(window.location.search).get('error');
  if (!error) return;

  const messages: Record<string, string> = {
    invalid: 'Please fill in your name, a valid email, and a message.',
    send_failed:
      'Something went wrong sending your message — please try again or email support@debtrelief.win.',
    log_failed:
      "Your message was sent to our support team — no need to resend. We just hit a snag saving a copy on our end, which we're looking into.",
  };

  const banner = document.getElementById('form-error');
  if (!banner) return;
  banner.textContent = messages[error] ?? messages.send_failed;
  banner.hidden = false;
}
