import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const TO_EMAIL = 'hello@johnlilly.dev';
const FROM_EMAIL = 'Johnlilly.dev <contact@johnlilly.dev>';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  // Honeypot — bots that fill every field trip this.
  if (formData.get('extra-details')) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const fullName = formData.get('full-name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const message = formData.get('message')?.toString().trim();

  if (!fullName || !email) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const fields: [string, string][] = [
    ['Full Name', fullName],
    ['Email', email],
    ['Phone', formData.get('phone')?.toString() ?? ''],
    ['Project Type', formData.get('project-type')?.toString() ?? ''],
    ['Budget', formData.get('budget')?.toString() ?? ''],
    ['Timeline', formData.get('timeline')?.toString() ?? ''],
    ['Message', message ?? ''],
  ];

  const html = fields
    .filter(([, value]) => value)
    .map(([label, value]) => `<p><strong>${label}:</strong> ${value.replace(/\n/g, '<br>')}</p>`)
    .join('');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New contact form submission from ${fullName}`,
        html,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 502 });
  }
};
