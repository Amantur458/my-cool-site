const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const FILE_PATH = path.join(process.cwd(), 'data.json'); 
const ADMIN_PASSWORD = "1234"; 

app.use(express.static('public'));
app.use(express.json());

const readNotes = () => {
    try {
        if (!fs.existsSync(FILE_PATH)) return [];
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeNotes = (notes) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2));
    } catch (e) {
        console.error("Ошибка записи:", e);
    }
};

const checkAuth = (req) => req.headers['authorization'] === ADMIN_PASSWORD;

app.post('/api/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.get('/api/notes', (req, res) => {
    if (!checkAuth(req)) return res.status(401).send("No auth");
    res.json(readNotes());
});

app.post('/api/notes', (req, res) => {
    if (!checkAuth(req)) return res.status(401).send("No auth");
    const notes = readNotes();
    const newNote = { id: Date.now(), text: req.body.text, date: new Date().toLocaleString() };
    notes.push(newNote);
    writeNotes(notes);
    res.json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
    if (!checkAuth(req)) return res.status(401).send("No auth");
    let notes = readNotes();
    const note = notes.find(n => n.id === parseInt(req.params.id));
    if (note) {
        note.text = req.body.text;
        writeNotes(notes);
        res.json({ success: true });
    } else res.status(404).send("Not found");
});

app.delete('/api/notes/:id', (req, res) => {
    if (!checkAuth(req)) return res.status(401).send("No auth");
    let notes = readNotes().filter(n => n.id !== parseInt(req.params.id));
    writeNotes(notes);
    res.json({ success: true });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
}
