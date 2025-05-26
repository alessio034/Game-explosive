const firebaseConfig = {
  apiKey: "AIzaSyA-JSGNvK-UoFQ1ST23UlAoZ3X6ExsnYEI",
  authDomain: "game-explosive.firebaseapp.com",
  databaseURL: "https://game-explosive-default-rtdb.firebaseio.com",
  projectId: "game-explosive",
  storageBucket: "game-explosive.firebasestorage.app",
  messagingSenderId: "287125113911",
  appId: "1:287125113911:web:ea0d8936459c80951d03b2",
  measurementId: "G-JSXFHZJPL0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let userId;

firebase.auth().signInAnonymously()
  .then(userCredential => {
    userId = userCredential.user.uid;
    //console.log("✅ Usuario autenticado:", userId);

    // Crear documento si no existe
    const userRef = db.collection("scores").doc(userId);
    userRef.get().then(doc => {
      if (!doc.exists) {
        const alias = generarAlias(); // Usa la función que hicimos antes
        userRef.set({
          alias: alias,
          maxLevel: 0
        });
        console.log("🆕 Alias creado:", alias);
      }
    });
  })
  .catch(error => {
    console.error("❌ Error en autenticación:", error);
  });

