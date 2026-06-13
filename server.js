const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const FILE_PATH = './data.json';
const ADMIN_PASSWORD = "1234"; // ТВОЙ ПАРОЛЬ

app.use(express.static('public'));
app.use(express.json());

// Чтение/запись файла
const readNotes = () => {
    if (!fs.existsSync(FILE_PATH)) return [];
    return JSON.parse(fs.readFileSync(FILE_PATH));
};
const writeNotes = (notes) => fs.writeFileSync(FILE_PATH, JSON.stringify(notes, null, 2));

// Проверка пароля
const checkAuth = (req) => req.headers['authorization'] === ADMIN_PASSWORD;

// Маршруты
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

app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));