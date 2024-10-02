// app.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
    const { heading } = req.body;
    const pdfPath = req.file.path;
    const content = await extractContentFromPDF(pdfPath, heading);
    fs.unlinkSync(pdfPath); // Clean up uploaded PDF

    res.render('result', { content });
});

// async function extractContentFromPDF(pdfPath, heading) {
//     const dataBuffer = fs.readFileSync(pdfPath);
//     const data = await pdf(dataBuffer);

//     const fullText = data.text;

//     // Modify regex to match heading like "1.1 Introduction"
//     const regex = new RegExp(`(${heading})(.*?)\\d+\\.\\d+`, 's');
//     const match = fullText.match(regex);
//     return match ? match[2].trim() : 'Content not found';
// }

async function extractContentFromPDF(pdfPath, heading) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const fullText = data.text;

    // Modify regex to match heading like "1.1 Introduction" and capture till the next subheading
    const regex = new RegExp(`(${heading.replace(/\./g, '\\.')})([\\s\\S]*?)(\\n\\d+\\.\\d+)`, 's');
    
    const match = fullText.match(regex);
    return match ? match[2].trim() : 'Content not found';
}




app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
