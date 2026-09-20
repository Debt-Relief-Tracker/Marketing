/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ASSETS: Fetcher;
  RESEND_API_KEY: string;
}

const CONTACT_PATH = '/contact';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

function sendEmail(apiKey: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  const form = await request.formData();

  // Honeypot: bots fill hidden fields, humans never see them. Pretend to
  // succeed so bots don't learn to avoid the field.
  if (String(form.get('company') ?? '') !== '') {
    return redirect(`${CONTACT_PATH}?success=1`);
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const topic = String(form.get('topic') ?? 'general').trim();
  const message = String(form.get('message') ?? '').trim();

  if (!name || !message || !isValidEmail(email)) {
    return redirect(`${CONTACT_PATH}?error=invalid`);
  }

  try {
    const notify = await sendEmail(env.RESEND_API_KEY, {
      from: 'Debt Relief Tracker <contact@debtrelief.win>',
      to: ['support@debtrelief.win'],
      reply_to: email,
      subject: `New contact form message (${topic})`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
    });
    if (!notify.ok) return redirect(`${CONTACT_PATH}?error=send_failed`);

    // Confirmation copy to the sender is best-effort — support was already
    // notified above, so a failure here shouldn't block the success redirect.
    void sendEmail(env.RESEND_API_KEY, {
      from: 'Debt Relief Tracker <support@debtrelief.win>',
      to: [email],
      subject: "We've received your message",
      text: `Hi ${name},\n\nThanks for reaching out — we got your message and will reply soon.\n\nYour message:\n${message}`,
    });
  } catch {
    return redirect(`${CONTACT_PATH}?error=send_failed`);
  }

  return redirect('/contact/thank-you');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
