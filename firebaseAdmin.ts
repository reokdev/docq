import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '', 'base64').toString()
);

let app: App;

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
    app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export { app as adminApp, adminDb, adminStorage };