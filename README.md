Here’s the **API documentation** for your chess application, including all endpoints, request/response formats, and examples. This documentation is designed to be clear and easy to follow for developers integrating with your API.

---

# **Chess API Documentation**  
**Base URL**: `http://localhost:3000/api`

---

## **Endpoints**

---

### **1. GET `/api/motivational-nugget`**  
Returns a random motivational quote. Perfect for keeping spirits high during intense chess games!  

**Response**:  
```json
{
  "quote": "string",
  "mood": "sassy|cheerful|grumpy",
  "timestamp": "ISO-8601"
}
```

**Example Request**:  
```http
GET /api/motivational-nugget
```

**Example Response**:  
```json
{
  "quote": "Code today, debug tomorrow. Or never. Your call.",
  "mood": "grumpy",
  "timestamp": "2023-10-05T14:30:00Z"
}
```

---

### **2. GET `/api/ip-hunting`**  
Retrieves geolocation details for a given IP address.  

**Query Parameters**:  
- `ip` (required): IPv4 or IPv6 address (e.g., `8.8.8.8`).  

**Response**:  
```json
{
  "ip": "string",
  "city": "string",
  "region": "string",
  "country_name": "string",
  "emoji_flag": "🇺🇸",
  "timezone": "string",
  "trivia": "string"
}
```

**Example Request**:  
```http
GET /api/ip-hunting?ip=142.250.179.206
```

**Example Response**:  
```json
{
  "ip": "142.250.179.206",
  "city": "Mountain View",
  "region": "California",
  "country_name": "United States",
  "emoji_flag": "🇺🇸",
  "timezone": "America/Los_Angeles",
  "trivia": "Fun fact: This IP once hosted a cat video viewed 12M times."
}
```

**Errors**:  
- `400 Bad Request`: Missing or invalid `ip` parameter.  
- `500 Internal Server Error`: Failed to fetch location data.  

---

### **3. GET `/api/fen-to-board`**  
Converts a FEN string to a chess board representation.  

**Query Parameters**:  
- `fen` (required): Valid FEN string (URL-encoded).  

**Response**:  
```json
{
  "board": "2D array",
  "fen": "string",
  "turn": "white|black",
  "is_checkmate": "boolean"
}
```

**Example Request**:  
```http
GET /api/fen-to-board?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201
```

**Example Response**:  
```json
{
  "board": [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ],
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "turn": "white",
  "is_checkmate": false
}
```

**Errors**:  
- `400 Bad Request`: Invalid or missing FEN.  

---

### **4. POST `/api/initBoard`**  
Initializes a new chess game with a FEN string.  

**Request Body**:  
```json
{
  "fen": "string"
}
```

**Response**:  
```json
{
  "board": "2D array",
  "fen": "string",
  "turn": "white|black"
}
```

**Example Request**:  
```http
POST /api/initBoard
Content-Type: application/json

{ "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }
```

**Example Response**:  
```json
{
  "board": [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ],
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "turn": "white"
}
```

**Errors**:  
- `400 Bad Request`: Invalid FEN.  

---

### **5. POST `/api/makeMove`**  
Makes a move in the current chess game.  

**Request Body**:  
```json
{
  "move": "string"
}
```
- `move`: Chess move in UCI format (e.g., `"e2e4"`).  

**Response**:  
```json
{
  "board": "2D array",
  "fen": "string",
  "turn": "white|black",
  "is_checkmate": "boolean"
}
```

**Example Request**:  
```http
POST /api/makeMove
Content-Type: application/json

{ "move": "e2e4" }
```

**Example Response**:  
```json
{
  "board": [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, "P", null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", null, "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ],
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  "turn": "black",
  "is_checkmate": false
}
```

**Errors**:  
- `400 Bad Request`: No active game or invalid move.  

---

## **Setup Instructions**  
1. Install dependencies:  
   ```bash
   npm install express axios lodash
   ```
2. Start the server:  
   ```bash
   node server.js
   ```
3. Access the API at `http://localhost:3000/api`.

---

## **Notes**  
- FEN strings must be URL-encoded for GET requests.  
- The chess game state persists in memory until the server restarts.  
- The `/api/ip-hunting` endpoint uses [ipapi.co](https://ipapi.co/).  

---

This documentation provides everything developers need to integrate with your API. Let me know if you need further clarifications! 🚀