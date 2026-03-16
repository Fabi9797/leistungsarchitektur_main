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

    // Convert base64 to blob
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });

    // Upload PDF to "Skripte" folder
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
    
    // Move file to Skripte folder
    await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?addParents=${skripteFolderId}&removeParents=root`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return Response.json({ success: true, fileId: result.id, fileName: result.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});