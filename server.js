const express = require('express');
const app = express();
const ChessValidator = require('./chess');
const axios = require('axios');
const _ = require('lodash');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper functions
const randomQuote = () => _.sample([
  "Checkmate is just a friendly suggestion",
  "Pawns dream of becoming queens",
  "Castling: because kings need safe spaces",
  "En passant: chess' sneakiest move"
]);

// Endpoints
app.get('/api/motivational-nugget', (req, res) => {
  res.json({
    quote: randomQuote(),
    timestamp: new Date().toISOString(),
    hint: "You've got this! ♟️"
  });
});

app.get('/api/ip-hunting', async (req, res) => {
  const { ip } = req.query;
  
  if (!ip) {
    return res.status(400).json({
      error: "IP parameter required",
      example: "/api/ip-hunting?ip=8.8.8.8"
    });
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    res.json({
      ip: response.data.ip,
      city: response.data.city,
      region: response.data.region,
      country: response.data.country_name,
      emoji_flag: String.fromCodePoint(...[...response.data.country_code.toUpperCase()].map(c => 127397 + c.charCodeAt(0))),
      coordinates: {
        latitude: response.data.latitude,
        longitude: response.data.longitude
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "IP lookup failed",
      reason: "Our digital bloodhound fell asleep"
    });
  }
});

app.get('/api/fen-to-board', (req, res) => {
  try {
    const chess = new ChessValidator(decodeURIComponent(req.query.fen));
    res.json({
      board: chess.getBoard(),
      fen: chess.getFEN(),
      turn: chess.whiteToMove ? 'white' : 'black',
      is_checkmate: chess.isCheckmate()
    });
  } catch (e) {
    res.status(400).json({
      error: "Invalid FEN",
      tip: "Try something like: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    });
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
    res.status(400).json({
      error: "Game initialization failed",
      reason: "The chess gods are displeased with that FEN"
    });
  }
});

app.post('/api/makeMove', (req, res) => {
  if (!activeGame) {
    return res.status(400).json({
      error: "No active game",
      solution: "Start a game with /api/initBoard first"
    });
  }

  try {
    activeGame.makeMove(req.body.move);
    res.json({
      board: activeGame.getBoard(),
      fen: activeGame.getFEN(),
      turn: activeGame.whiteToMove ? 'white' : 'black',
      is_checkmate: activeGame.isCheckmate(),
      message: _.sample(["Nice move!", "Interesting choice!", "The plot thickens..."])
    });
  } catch (e) {
    res.status(400).json({
      error: "Invalid move",
      advice: "Maybe try chess instead of checkers?"
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something broke!",
    emergency_plan: "Offer the chess pieces some coffee and try again"
  });
});

// Start server
const PORT = 41279;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log('Endpoints:');
  console.log(`- GET    /api/motivational-nugget`);
  console.log(`- GET    /api/ip-hunting?ip=IP_ADDRESS`);
  console.log(`- GET    /api/fen-to-board?fen=ENCODED_FEN`);
  console.log(`- POST   /api/initBoard`);
  console.log(`- POST   /api/makeMove`);
});