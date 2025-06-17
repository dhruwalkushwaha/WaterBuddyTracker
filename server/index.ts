// server/index.ts
import express from 'express';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Serve static files from the Vite build output
app.use(express.static(path.join(__dirname, 'public')));

// For all other routes, send back index.html
app.get('/*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
