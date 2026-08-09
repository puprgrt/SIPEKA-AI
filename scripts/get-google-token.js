import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables
dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); // Might be executed from scripts dir or root
dotenv.config(); // fallback to current dir

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from your .env file!");
  console.error("Please add them to your .env file first.");
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost'; // Use localhost for copy-pasting from URL bar

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// If urn:ietf:wg:oauth:2.0:oob is blocked, you may need to use a local server approach. 
// For simplicity, we try OOB first.

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // Force consent screen to guarantee a refresh token is returned
  scope: SCOPES,
});

console.log('===========================================================');
console.log('🔑 SIPEKA Google Workspace OAuth2 Token Generator');
console.log('===========================================================');
console.log('1. Click or copy this link and open it in your browser:');
console.log('\n', authUrl, '\n');
console.log('2. Log in with your Google account and grant permissions.');
console.log('3. You will be redirected to a page that gives you an authorization code.');
console.log('===========================================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste the authorization code here: ', async (code) => {
  try {
    console.log('\nExchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Here is your Refresh Token:\n');
    console.log(tokens.refresh_token);
    console.log('\nAdd this to your .env file as:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    
    if (!tokens.refresh_token) {
       console.log('\n⚠️ WARNING: No refresh token was returned.');
       console.log('This usually happens if you have previously granted consent to this app.');
       console.log('To get a new refresh token, you may need to revoke the app\'s access from your Google Account settings first (https://myaccount.google.com/permissions), and then run this script again.');
    }
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
  } finally {
    rl.close();
  }
});
