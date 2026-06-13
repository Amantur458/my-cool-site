document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');
    const userInput = document.getElementById('userInput');
    const list = document.getElementById('messageList');

    let password = localStorage.getItem('app_pass');

    // Обертка для запросов с паролем
    async function api(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': password }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(url, options);
        if (res.status === 401) logout();
        return res.json();
    }

    const loadNotes = async () => {
        const notes = await api('/api/notes');
        list.innerHTML = notes.map(n => `
            <li>
                <div>
                    <b onclick="editNote(${n.id}, '${n.text}')">${n.text}</b><br>
                    <span class="note-date">${n.date}</span>
                </div>
                <button onclick="deleteNote(${n.id})">❌</button>
            </li>
        `).join('');
    };

    window.editNote = async (id, oldText) => {
        const newText = prompt("Редактировать:", oldText);
        if (newText) { await api(`/api/notes/${id}`, 'PUT', { text: newText }); loadNotes(); }
    };

    window.deleteNote = async (id) => {
        if (confirm("Удалить?")) { await api(`/api/notes/${id}`, 'DELETE'); loadNotes(); }
    };

    window.logout = () => { localStorage.removeItem('app_pass'); location.reload(); };

    document.getElementById('loginBtn').onclick = async () => {
        const pass = document.getElementById('passInput').value;
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        if (res.ok) { localStorage.setItem('app_pass', pass); location.reload(); }
        else alert("Неверный пароль");
    };

    document.getElementById('sendBtn').onclick = async () => {
        if (!userInput.value) return;
        await api('/api/notes', 'POST', { text: userInput.value });
        userInput.value = '';
        loadNotes();
    };

    // Тема
    const themeBtn = document.getElementById('themeToggle');
    const toggleTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
        themeBtn.innerText = t === 'dark' ? '☀️' : '🌙';
    };
    themeBtn.onclick = () => toggleTheme(localStorage.getItem('theme') === 'dark' ? 'light' : 'dark');
    toggleTheme(localStorage.getItem('theme') || 'light');

    if (password) {
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';
        loadNotes();
    }
});