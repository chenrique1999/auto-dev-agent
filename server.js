const express = require('express');
const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// GET /version -> returns version
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
