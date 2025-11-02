

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBXox1tx7O9-VCV24FLrcPBvyE-Gw8hnTk",
  authDomain: "projectfirebase-dd829.firebaseapp.com",
  databaseURL: "https://projectfirebase-dd829-default-rtdb.firebaseio.com",
  projectId: "projectfirebase-dd829",
  storageBucket: "projectfirebase-dd829.firebasestorage.app",
  messagingSenderId: "492894353806",
  appId: "1:492894353806:web:1c281ac658691b2e5f4cdf",
  measurementId: "G-HX5MFYV13H"
};
 

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const database = getDatabase(app);

const messaging: Messaging = getMessaging(app);

export const requestForToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BDbL9_iuOuY1aU2jJBhyDuLxF9hfRvTsAseNxL87CxATrVlQl4gCxSeiRrGgmag0kkpbQGDfIs0P68KsABu9iaA",
    });
    return token || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    if (payload.notification?.title) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/static/images/logo_dark.png",
      });
    }
  });
};

export { app };
