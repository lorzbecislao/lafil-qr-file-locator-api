// Load env variables
require('dotenv').config();

const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 3000;

var QRCode = require('qrcode');

// CORS configuration
const corsOptions = {
    origin: process.env.APP_FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
};

app.use(cors(corsOptions));
app.use('/uploads', express.static('uploads')); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder where files will be stored
    },
    filename: (req, file, cb) => {
        // Generate unique file name
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName)  
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
    // Generate the QR code for the file location
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(fileUrl);
        res.json({
        message: 'File uploaded successfully',
        file: req.file,
        qrCode: qrCodeDataUrl, // Return the generated QR code as a data URL
        fileUrl: fileUrl,      // Return the file URL
    });
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Test API
app.get('/api/hello', async (req, res) => {
    res.send('Hello World!');
});
