const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = require('./sales-coach-ai-firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: 'http://localhost:3000'  // Adjust this if your frontend URL changes
}));

// Middleware to authenticate Firebase ID token
app.use(async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).send('Unauthorized');
  }
  
  const idToken = req.headers.authorization.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying ID token: ", error);
    return res.status(403).send('Unauthorized');
  }
});

// Endpoint to handle the form submission and save it to Firestore
app.post('/submit', async (req, res) => {
    const { firstName, email, phoneNumber, transcript } = req.body;
    const userId = req.user.uid;

    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
            await userDocRef.set({
                firstName,
                email,
                phoneNumber,
                submissions: [transcript]
            });
        } else {
            await userDocRef.update({
                submissions: admin.firestore.FieldValue.arrayUnion(transcript)
            });
        }
        
        res.status(200).send({ message: "Submission saved successfully" });
    } catch (error) {
        console.error("Error saving document: ", error);
        res.status(500).send('Error processing the request');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
