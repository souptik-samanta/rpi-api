const express = require('express');
const app = express();
const ChessValidator = require('./chess');
const axios = require('axios');
const _ = require('lodash');

app.use((req, res, next) => {
  res.locals.startTime = Date.now();
  next();
});

app.use(express.json());

// Emoji mapping
const pieceEmojis = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛',
  'k': '♚', 'p': '♟', 'R': '♖', 'N': '♘',
  'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

// Helper functions
const randomTaunt = () => _.sample([
  "Bold move, let's see how that works out",
  "That's... an interesting strategy",
  "Are you sure about that? Asking for a friend"
]);

// Endpoints
app.get('/api/motivate-me', (req, res) => {
  res.json({
    quote: _.sample([
      "Code now, debug later",
      "Commit often, regret less",
      "Ctrl+S is life"
    ]),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ip-hunting', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: "IP parameter required" });
  
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    res.json({
      ...response.data,
      emoji_flag: String.fromCodePoint(...[...(response.data.country_code || 'XX').toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
    });
  } catch (error) {
    res.status(500).json({ error: "IP lookup failed" });
  }
});

app.get('/api/fen2board', (req, res) => {
  try {
    const chess = new ChessValidator(decodeURIComponent(req.query.fen));
    res.json({
      board: chess.getBoard(),
      fen: chess.getFEN(),
      turn: chess.whiteToMove ? 'white' : 'black',
      is_checkmate: chess.isCheckmate()
    });
  } catch (e) {
    res.status(400).json({ error: "Invalid FEN" });
  }
});

let activeGame = null;

app.post('/api/initBoard', (req, res) => {
  try {
    activeGame = new ChessValidator(req.body.fen);
    res.json({
      board: activeGame.getBoard(),
      fen: activeGame.getFEN(),
      turn: activeGame.whiteToMove ? 'white' : 'black'
    });
  } catch (e) {
    res.status(400).json({ error: "Invalid FEN" });
  }
});

app.post('/api/makeMove', (req, res) => {
  if (!activeGame) return res.status(400).json({ error: "No active game" });
  
  try {
    activeGame.makeMove(req.body.move);
    res.json({
      board: activeGame.getBoard(),
      fen: activeGame.getFEN(),
      turn: activeGame.whiteToMove ? 'white' : 'black',
      taunt: randomTaunt()
    });
  } catch (e) {
    res.status(400).json({ error: "Invalid move" });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Chess endpoints ready! ♟️');
});