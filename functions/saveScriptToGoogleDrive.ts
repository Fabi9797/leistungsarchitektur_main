import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { pdfBase64, fileName } = await req.json();

    if (!pdfBase64 || !fileName) {
      return Response.json({ error: 'Missing pdfBase64 or fileName' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('googledrive');
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({ error: 'Google Drive not authorized. Please authorize first.', details: e.message }, { status: 401 });
    }

    // Find "Content" folder efficiently (search all folders at once)
    const folderSearchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=(name='Content' or name='Skripte') and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&pageSize=25&fields=files(id,name,parents)`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const folderSearchData = await folderSearchRes.json();
    
    let contentFolderId = folderSearchData.files?.find(f => f.name === 'Content')?.id;
    let skripteFolderId = folderSearchData.files?.find(f => f.name === 'Skripte' && f.parents?.includes(contentFolderId))?.id;

    // Create "Content" folder if missing
    if (!contentFolderId) {
      const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Content',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      const folderData = await createFolderRes.json();
      contentFolderId = folderData.id;
    }

    // Create "Skripte" folder if missing
    if (!skripteFolderId) {
      const createSkripteRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Skripte',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [contentFolderId],
        }),
      });
      const skripteData = await createSkripteRes.json();
      skripteFolderId = skripteData.id;
    }

    // Convert base64 to binary
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload PDF with metadata directly into "Skripte" folder using multipart
    const boundary = 'boundary_upload_' + Date.now();
    const metadata = JSON.stringify({ name: fileName, parents: [skripteFolderId] });
    
    // Build multipart body manually
    const parts = [];
    parts.push(`--${boundary}`);
    parts.push('Content-Type: application/json; charset=UTF-8');
    parts.push('');
    parts.push(metadata);
    parts.push(`--${boundary}`);
    parts.push('Content-Type: application/pdf');
    parts.push('Content-Transfer-Encoding: binary');
    parts.push('');
    
    const textPart = parts.join('\r\n');
    const fullBody = new Uint8Array(textPart.length + bytes.length + (`\r\n--${boundary}--`).length);
    
    let offset = 0;
    for (let i = 0; i < textPart.length; i++) {
      fullBody[offset++] = textPart.charCodeAt(i);
    }
    for (let i = 0; i < bytes.length; i++) {
      fullBody[offset++] = bytes[i];
    }
    const endPart = `\r\n--${boundary}--`;
    for (let i = 0; i < endPart.length; i++) {
      fullBody[offset++] = endPart.charCodeAt(i);
    }

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: fullBody,
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