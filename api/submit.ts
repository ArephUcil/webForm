const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    return res.status(500).json({ message: 'Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable.' });
  }

  try {
    const payload = req.body;
    const googleRes = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleRes.ok) {
      const text = await googleRes.text();
      return res.status(502).json({ message: 'Google Sheets webhook error', details: text });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: error?.message ?? 'Unexpected server error.' });
  }
}
