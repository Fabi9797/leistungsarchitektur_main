import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pdfBase64, fileName } = await req.json();

    if (!pdfBase64 || !fileName) {
      return Response.json({ error: 'Missing pdfBase64 or fileName' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Convert base64 to blob
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });

    // Upload to Google Drive
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      return Response.json({ error: 'Google Drive upload failed', details: errorText }, { status: uploadRes.status });
    }

    const result = await uploadRes.json();
    return Response.json({ success: true, fileId: result.id, fileName: result.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});