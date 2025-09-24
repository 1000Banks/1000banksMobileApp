const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Telegram API proxy function
exports.telegramProxy = functions.https.onCall(async (data, context) => {
  // Verify the request is from an admin
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  // Check if user is admin
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || !userDoc.data().isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }

  const { method, endpoint, botToken } = data;

  if (!botToken || !endpoint) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const fetch = require('node-fetch');
    const url = `https://api.telegram.org/bot${botToken}/${endpoint}`;

    console.log('Proxying request to:', url);

    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    console.log('Telegram API response:', result);

    return {
      success: response.ok,
      data: result,
      status: response.status
    };

  } catch (error) {
    console.error('Proxy error:', error);
    throw new functions.https.HttpsError('internal', 'Proxy request failed');
  }
});