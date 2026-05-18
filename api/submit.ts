const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export default async function handler(req: any, res: any) {
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
    const payload = req.body;
    console.log('Forwarding to Google Sheets:', { url: GOOGLE_SHEETS_WEBHOOK_URL, payloadSize: JSON.stringify(payload).length });
    
    const googleRes = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

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
    console.log('Google Sheets webhook success:', successBody);
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Submit handler error:', error);
    return res.status(500).json({ 
      message: error?.message ?? 'Unexpected server error.',
      errorType: error?.constructor?.name
    });
  }
}
