importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
   console.log("Background message received:", payload);
  const notificationTitle = payload?.notification?.title || "Notification";
  
  const notificationOptions = {
    body: payload?.notification?.body || "You have new message",
    icon: "/static/images/logo_dark.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
  console.log("Notification displayed");
  // playNotificationSound();
  // new Notification(notificationTitle, notificationOptions);
});
