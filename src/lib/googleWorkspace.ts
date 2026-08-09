import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Initializes the Google Drive API client using OAuth2 and a Refresh Token.
 */
function getDriveService() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.warn('Google Workspace OAuth2 credentials not found. File uploads to Google Drive will be skipped or fail.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Uploads a file (from a Buffer) to Google Drive.
 * @param fileBuffer The file content as a Buffer.
 * @param fileName The name of the file to save as.
 * @param mimeType The MIME type of the file.
 * @returns The uploaded file's ID in Google Drive.
 */
export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  try {
    const driveService = getDriveService();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured in environment variables.');
    }

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    return response.data.id || null;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    return null;
  }
}

/**
 * Uploads a file (from a base64 string) to Google Drive.
 * @param base64String The file content as a base64 string.
 * @param fileName The name of the file to save as.
 * @param mimeType The MIME type of the file.
 * @returns The uploaded file's ID in Google Drive.
 */
export async function uploadBase64ToDrive(base64String: string, fileName: string, mimeType: string): Promise<string | null> {
  // Extract base64 data if it includes a data URI scheme
  const base64Data = base64String.includes('base64,') 
    ? base64String.split('base64,')[1] 
    : base64String;
    
  const buffer = Buffer.from(base64Data, 'base64');
  return uploadFileToDrive(buffer, fileName, mimeType);
}

/**
 * Generates a public view link for a file in Google Drive.
 * Note: Requires the service account to have permissions to change sharing settings, 
 * or the folder to already be shared publicly.
 */
export async function getFileLink(fileId: string): Promise<string | null> {
  try {
    const driveService = getDriveService();
    
    // Make file accessible to anyone with the link
    await driveService.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await driveService.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });

    return result.data.webViewLink || null;
  } catch (error) {
    console.error('Error getting file link from Google Drive:', error);
    return null;
  }
}
