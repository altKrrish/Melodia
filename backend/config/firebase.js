import admin from 'firebase-admin';
import config from './index.js';
import logger from './logger.js';

let firebaseApp;

export const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          type: 'service_account',
          project_id: config.FIREBASE_CONFIG.projectId,
          private_key_id: 'key-id',
          private_key: config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: config.FIREBASE_CLIENT_EMAIL,
          client_id: 'client-id',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        }),
        storageBucket: config.FIREBASE_CONFIG.storageBucket,
      });
      logger.info('Firebase initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    logger.error(`Firebase initialization failed: ${error.message}`);
    throw error;
  }
};

export const getFirebaseStorage = () => {
  if (!firebaseApp) initializeFirebase();
  return admin.storage().bucket();
};

export const uploadFileToFirebase = async (filePath, fileBuffer, contentType) => {
  try {
    const bucket = getFirebaseStorage();
    const file = bucket.file(filePath);
    await file.save(fileBuffer, { metadata: { contentType } });
    const [url] = await file.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });
    return url;
  } catch (error) {
    logger.error(`Firebase upload failed: ${error.message}`);
    throw error;
  }
};

export const deleteFileFromFirebase = async (filePath) => {
  try {
    const bucket = getFirebaseStorage();
    await bucket.file(filePath).delete();
    logger.info(`File deleted from Firebase: ${filePath}`);
  } catch (error) {
    logger.error(`Firebase delete failed: ${error.message}`);
  }
};

export default { initializeFirebase, getFirebaseStorage, uploadFileToFirebase, deleteFileFromFirebase };
