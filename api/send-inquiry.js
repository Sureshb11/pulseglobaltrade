/**
 * Delivers quote requests and contact inquiries to the sales inbox.
 *
 * Vercel serves this as a serverless function at /api/send-inquiry. It is the
 * only server-side code in the project; everything else is static.
 *
 * Configuration (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY  required — https://resend.com/api-keys
 *   MAIL_TO         optional — defaults to sales@pulseglobaltrade.com
 *   MAIL_FROM       optional — defaults to Resend's shared sending domain,
 *                   which works without DNS setup. Switch to an address on a
 *                   verified pulseglobaltrade.com once the domain is added in
 *                   Resend, so replies and deliverability come from the brand.
 */

const MAIL_TO = process.env.MAIL_TO || 'sales@pulseglobaltrade.com';
const MAIL_FROM = process.env.MAIL_FROM || 'PulseGlobal Trade <onboarding@resend.dev>';

/* Only these keys are ever read off the request, so a crafted payload cannot
   stuff arbitrary content into the email. */
const FIELDS = {
  quote: [
    ['firstName', 'First name'],
    ['lastName', 'Last name'],
    ['companyName', 'Company'],
    ['email', 'Business email'],
    ['phone', 'Phone'],
    ['commodity', 'Commodity / product'],
    ['origin', 'Origin'],
    ['destination', 'Destination'],
    ['weight', 'Est. weight (kg)'],
    ['volume', 'Est. volume (cbm)'],
    ['containerType', 'Container type'],
    ['notes', 'Special handling'],
  ],
  contact: [
    ['first_name', 'First name'],
    ['last_name', 'Last name'],
    ['email', 'Business email'],
    ['inquiry_type', 'Inquiry type'],
    ['message', 'Message'],
  ],
};

const REQUIRED = { quote: ['email', 'commodity'], contact: ['email'] };
const SUBJECT = { quote: 'New quote request', contact: 'New website inquiry' };

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set — cannot send inquiry mail');
    return res.status(500).json({ ok: false, error: 'Email is not configured yet.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body) return res.status(400).json({ ok: false, error: 'Invalid request.' });

  const kind = body.formType === 'contact' ? 'contact' : 'quote';

  // Honeypot: a real person never fills a field that is hidden from them.
  // Answer 200 so bots see success and do not retry with variations.
  if (body.company_website) return res.status(200).json({ ok: true });

  const missing = REQUIRED[kind].filter((k) => !String(body[k] ?? '').trim());
  if (missing.length) {
    return res.status(400).json({ ok: false, error: 'Please complete the required fields.' });
  }
  if (!isEmail(body.email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid business email.' });
  }

  const rows = FIELDS[kind]
    .map(([key, label]) => [label, String(body[key] ?? '').trim()])
    .filter(([, value]) => value.length);

  const html = `
    <h2 style="font:600 18px system-ui;margin:0 0 16px">${SUBJECT[kind]}</h2>
    <table style="border-collapse:collapse;font:14px system-ui">
      ${rows
        .map(
          ([label, value]) =>
            `<tr>
               <td style="padding:6px 16px 6px 0;color:#555;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
               <td style="padding:6px 0">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
             </tr>`,
        )
        .join('')}
    </table>
    <p style="font:12px system-ui;color:#777;margin-top:24px">
      Sent from pulseglobaltrade.com
    </p>`;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const who = [body.firstName || body.first_name, body.lastName || body.last_name]
    .filter(Boolean)
    .join(' ');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        // Replying in the mail client goes straight back to the enquirer.
        reply_to: body.email,
        subject: who ? `${SUBJECT[kind]} — ${who}` : SUBJECT[kind],
        html,
        text,
      }),
    });

    if (!response.ok) {
      // Log the provider's reason server-side; never reflect it to the client.
      console.error('Resend rejected the message', response.status, await response.text());
      return res
        .status(502)
        .json({ ok: false, error: 'We could not send that just now. Please email us directly.' });
    }
  } catch (err) {
    console.error('Failed to reach the email provider', err);
    return res
      .status(502)
      .json({ ok: false, error: 'We could not send that just now. Please email us directly.' });
  }

  return res.status(200).json({ ok: true });
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
