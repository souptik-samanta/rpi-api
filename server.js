const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const geoip = require('geoip-lite');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000;
const ip = '0.0.0.0';

app.use(bodyParser.json());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

db.serialize(() => {
  // Create table for health logs
  db.run(`CREATE TABLE IF NOT EXISTS health_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    password TEXT,
    timestamp TEXT,
    log TEXT
  )`);

  // Create table for quotes
  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT,
    created_at TEXT
  )`);

  // Create table for URL shortener
  db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    created_at TEXT,
    clicks INTEGER DEFAULT 0
  )`);

  // Populate default quotes if none exist
  db.get("SELECT COUNT(*) as count FROM quotes", (err, row) => {
    if (err) {
      console.error("Error counting quotes:", err);
    } else if (row.count === 0) {
      const defaultQuotes = [
        "The strongest people are not those who show strength in front of us but those who win battles we know nothing about. - Unknown",
        "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.' - Mary Anne Radmacher",
        "The human capacity for burden is like bamboo – far more flexible than you'd ever believe at first glance. - Jodi Picoult",
        "Stars can't shine without darkness. - D.H. Sidebottom",
        "You never know how strong you are until being strong is your only choice. - Bob Marley",
        "The soul always knows what to do to heal itself. The challenge is to silence the mind. - Caroline Myss",
        "Not the load but your reaction to the load breaks you. - Chinese Proverb",
        "A river cuts through rock not because of its power but because of its persistence. - James N. Watkins",
        "The broken will always be able to love harder than most. Once you've been in the dark, you learn to appreciate everything that shines. - Zachary K. Douglas",
        "Healing is not about moving on or 'getting over it,' it's about learning to make peace with our pain. - Unknown"
      ];
      const stmt = db.prepare("INSERT INTO quotes (quote, created_at) VALUES (?, ?)");
      const now = new Date().toISOString();
      defaultQuotes.forEach(q => {
        stmt.run(q, now);
      });
      stmt.finalize();
    }
  });
});

// GET a random quote
app.get('/quote', (req, res) => {
  db.all("SELECT * FROM quotes", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (rows.length === 0) {
      res.status(404).json({ error: "No quotes available" });
    } else {
      const randomQuote = rows[Math.floor(Math.random() * rows.length)].quote;
      res.json({ quote: randomQuote });
    }
  });
});

// POST a new quote
app.post('/quote', (req, res) => {
  const { quote } = req.body;
  if (!quote) {
    return res.status(400).json({ error: "Missing quote in request body" });
  }
  const now = new Date().toISOString();
  db.run("INSERT INTO quotes (quote, created_at) VALUES (?, ?)", [quote, now], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ status: "success", quoteId: this.lastID });
    }
  });
});

// GET BMI calculation
app.get('/bmi', (req, res) => {
  try {
    const weight = parseFloat(req.query.w);
    const height = parseFloat(req.query.h);
    const units = (req.query.u || 'm').toLowerCase();
    const gender = (req.query.g || '').toLowerCase();
    const age = parseInt(req.query.a);

    if (!weight || !height || !age) {
      throw new Error('Missing parameters. Required: w=weight&h=height&a=age');
    }
    
    let bmi;
    if (units === 'm') {
      const heightMeters = height / 100;
      bmi = weight / (heightMeters ** 2);
    } else {
      bmi = (weight * 703) / (height ** 2);
    }

    res.json({
      parameters: {
        weight,
        height,
        units: units === 'm' ? 'metric (kg/cm)' : 'imperial (lbs/inches)',
        gender: gender === 'm' ? 'male' : 'female',
        age
      },
      bmi: bmi.toFixed(1),
      note: 'BMI is a general indicator. Consult a healthcare professional for proper assessment.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET geolocation information using geoip-lite
app.get('/geolocation', (req, res) => {
  try {
    const ipAddress = req.query.ip || req.ip;
    const geo = geoip.lookup(ipAddress);
    if (!geo) {
      throw new Error("Geolocation lookup failed for IP: " + ipAddress);
    }
    res.json({
      ip: ipAddress,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      coordinates: {
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      note: 'If no IP is provided, your current IP will be used'
    });
  }
});

// POST a health log entry
app.post('/loghealth', (req, res) => {
  const { n: name, p: password, log } = req.query;
  if (!name || !password || !log) {
    return res.status(400).json({ error: 'Missing parameters. Required: n=name&p=password&log=log_entry' });
  }
  const timestamp = new Date().toISOString();
  db.run("INSERT INTO health_logs (name, password, timestamp, log) VALUES (?, ?, ?, ?)",
    [name, password, timestamp, log],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        db.get("SELECT COUNT(*) as count FROM health_logs WHERE name = ? AND password = ?", [name, password], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({
              status: 'success',
              message: 'Health log added successfully',
              totalLogs: row.count
            });
          }
        });
      }
    }
  );
});

// GET all health logs for a user
app.get('/getlog', (req, res) => {
  const { n: name, p: password } = req.query;
  if (!name || !password) {
    return res.status(400).json({ error: 'Missing parameters. Required: n=name&p=password' });
  }
  db.all("SELECT timestamp, log FROM health_logs WHERE name = ? AND password = ?", [name, password], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (rows.length === 0) {
      res.status(404).json({ error: 'User not found or no logs available' });
    } else {
      res.json({
        status: 'success',
        logs: rows,
        totalLogs: rows.length
      });
    }
  });
});

// POST email sending endpoint
app.post('/email/:senderEmail/:appPass/:recipientEmail/:message', async (req, res) => {
  const { senderEmail, appPass, recipientEmail, message } = req.params;
  
  // Basic validation for required parameters
  if (!senderEmail || !appPass || !recipientEmail || !message) {
    return res.status(400).json({ error: "Missing one or more required parameters: senderEmail, appPass, recipientEmail, or message." });
  }

  try {
    // Setup the nodemailer transporter using the provided sender credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: appPass
      }
    });

    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: 'Message from our API',
      text: message
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ status: 'success', info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utility function to generate a unique short code
function generateShortCode() {
  return crypto.randomBytes(4).toString('hex');
}

// POST endpoint to create a shortened URL
app.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing URL in request body" });
  }

  const shortCode = generateShortCode();
  const now = new Date().toISOString();

  db.run("INSERT INTO urls (original_url, short_code, created_at) VALUES (?, ?, ?)",
    [url, shortCode, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const shortUrl = `${req.protocol}://${req.get('host')}/u/${shortCode}`;
        res.json({
          original_url: url,
          short_url: shortUrl,
          short_code: shortCode
        });
      }
    }
  );
});

// GET endpoint for URL redirection using the short code
app.get('/u/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  db.get("SELECT original_url FROM urls WHERE short_code = ?", [shortCode], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: "URL not found" });
    } else {
      // Increment the click count
      db.run("UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?", [shortCode]);
      res.redirect(row.original_url);
    }
  });
});

// GET endpoint to retrieve statistics for a shortened URL
app.get('/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  db.get("SELECT * FROM urls WHERE short_code = ?", [shortCode], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: "URL not found" });
    } else {
      res.json({
        original_url: row.original_url,
        short_code: row.short_code,
        created_at: row.created_at,
        clicks: row.clicks
      });
    }
  });
});

// Root endpoint that lists all available API endpoints
app.get('/', (req, res) => {
  res.json({
    endpoints: {
      '/quote': 'GET - Get a random motivational quote from DB',
      '/quote': 'POST - Add a new quote (JSON body: { "quote": "your quote" })',
      '/bmi?w=WEIGHT&h=HEIGHT&u=UNITS(m/i)&g=GENDER(m/f)&a=AGE': 'GET - Calculate BMI',
      '/geolocation?ip=IP': 'GET - Get geolocation info for IP (using geoip-lite)',
      '/loghealth?n=NAME&p=PASSWORD&log=LOG': 'POST - Log health data (stored in DB)',
      '/getlog?n=NAME&p=PASSWORD': 'GET - Get health logs from DB',
      '/email/:senderEmail/:appPass/:recipientEmail/:message': 'POST - Send an email using provided credentials',
      '/shorten': 'POST - Create short URL (JSON body: { "url": "your_url" })',
      '/u/:shortCode': 'GET - Redirect to original URL',
      '/stats/:shortCode': 'GET - Get statistics for shortened URL'
    }
  });
});

// Start the server
app.listen(port, ip, () => {
  console.log(`Server running on http://localhost:${port}`);
});
