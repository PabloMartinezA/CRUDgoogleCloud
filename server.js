// Importar módulos necesarios
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } = require("firebase/firestore");



// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};


// Inicializar Firebase y Firestore
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
app.use(bodyParser.json());

// Configura Express para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Crear nuevo producto (POST)
app.post("/api/productos", async (req, res) => {
    try {
        const { descripcion, precio, cantidad } = req.body;
        const newProduct = { descripcion, precio, cantidad };
        const docRef = await addDoc(collection(db, "productos"), newProduct);
        res.status(201).json({ id: docRef.id, ...newProduct });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los productos (GET)
app.get("/api/productos", async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "productos"));
        const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar producto existente (PUT)
app.put("/api/productos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, precio, cantidad } = req.body;
        const productRef = doc(db, "productos", id);

        await updateDoc(productRef, { descripcion, precio, cantidad });
        res.status(200).json({ id, descripcion, precio, cantidad });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto (DELETE)
app.delete("/api/productos/:id", async (req, res) => {
    try {
        const { id } = req.params; 
        await deleteDoc(doc(db, "productos", id));
        res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// Inicia el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
