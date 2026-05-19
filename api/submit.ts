import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    return res.status(500).json({ 
      message: 'Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable. Please set it in Vercel dashboard.',
      details: 'No webhook URL configured'
    });
  }

  try {
    const payload = req.body || {};
    
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: 'Request body is empty' });
    }

    console.log('Forwarding to Google Sheets:', { url: GOOGLE_SHEETS_WEBHOOK_URL, payloadSize: JSON.stringify(payload).length });
    
    const googleRes = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    // Detect if we were redirected to a login page (common with /dev URLs)
    if (googleRes.url.includes('accounts.google.com') || googleRes.url.includes('ServiceLogin')) {
      console.error('Redirected to Google Login page. Webhook URL is likely private or incorrect.');
      return res.status(401).json({ 
        message: 'Authentication failed: Webhook URL is private.', 
        details: 'The URL redirected to a login page. Use the /exec URL and set access to "Anyone".' 
      });
    }

    if (!googleRes.ok) {
      const text = await googleRes.text();
      console.error('Google Sheets webhook failed:', { status: googleRes.status, body: text });
      return res.status(502).json({ 
        message: 'Google Sheets webhook error', 
        details: text,
        webhookStatus: googleRes.status
      });
    }

    const successBody = await googleRes.text();
    console.log('Google Sheets webhook response:', successBody);

    // Some GAS scripts return success message in the body even if there was an internal error
    if (successBody.includes('"status":"error"')) {
       return res.status(500).json({ message: 'Google Script internal error', details: successBody });
    }
    
    return res.status(200).json({ success: true, details: successBody });
  } catch (error: unknown) {
    console.error('Submit handler error:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Unexpected server error.',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
  }
}
