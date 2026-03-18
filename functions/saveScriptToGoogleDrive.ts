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

    // Upload PDF file directly
    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/pdf',
      },
      body: pdfBase64,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      return Response.json({ error: 'Google Drive upload failed', details: errorText }, { status: uploadRes.status });
    }

    const uploadedFile = await uploadRes.json();
    
    // Move to folder with new name in one PATCH call
    const updateRes = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadedFile.id}?fields=id,name,parents`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        parents: [skripteFolderId]
      }),
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      return Response.json({ error: 'Failed to move file', details: errorText }, { status: updateRes.status });
    }

    const result = await updateRes.json();
    return Response.json({ success: true, fileId: result.id, fileName: result.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});