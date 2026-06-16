// Scripts nécessaires pour FCM dans le Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuration Firebase (Doit être identique à celle de firebase.js)
// Note: Le SW ne peut pas accéder à import.meta.env facilement, 
// donc il est préférable de copier les valeurs ici ou de générer ce fichier via build.
firebase.initializeApp({
  apiKey: "AIzaSyAC_RN3QcRw4jVnBVLeTvQYFLEo_sm2HCc",
  authDomain: "attieke-dekoungbe-deec5.firebaseapp.com",
  projectId: "attieke-dekoungbe-deec5",
  storageBucket: "attieke-dekoungbe-deec5.firebasestorage.app",
  messagingSenderId: "777732134757",
  appId: "1:777732134757:web:c29cb1e84855d3a0c8338c"
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Chemin vers votre icône
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
