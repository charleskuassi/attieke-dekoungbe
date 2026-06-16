import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Remplacer par vos propres clés récupérées dans la console Firebase
// (Paramètres du projet > Général > Vos applications > Ajouter une application Web)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "VOTRE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "votre-projet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "votre-projet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "votre-projet.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "votre-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "votre-app-id"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Demande la permission et récupère le Token FCM
 */
export const requestFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // VAPID_KEY: Récupérée dans Paramètres du projet > Cloud Messaging > Cloud Messaging (V1) > Certificats Web Push
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      
      if (token) {
        return token;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
      }
    } else {
      console.warn("Permission de notification refusée.");
    }
  } catch (error) {
    console.error("Erreur durant la récupération du token FCM:", error);
  }
  return null;
};

/**
 * Écoute les messages quand l'app est au premier plan
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message reçu au premier plan:", payload);
      resolve(payload);
    });
  });

export default app;
