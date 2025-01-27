const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const ip='0.0.0.0';
const healthLogs = new Map();

app.use(bodyParser.json());

const quotes = [
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

// Random quote endpoint
app.get('/quote', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ 
    quote: randomQuote
  });
});

// BMI Calculator endpoint
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
        weight: weight,
        height: height,
        units: units === 'm' ? 'metric (kg/cm)' : 'imperial (lbs/inches)',
        gender: gender === 'm' ? 'male' : 'female',
        age: age
      },
      bmi: bmi.toFixed(1),
      note: 'BMI is a general indicator. Consult healthcare professional for proper assessment.'
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Geolocation 
app.get('/geolocation', async (req, res) => {
  try {
    const ip = req.query.ip || req.ip;
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    
    if (response.data.status === 'fail') {
      throw new Error(response.data.message || 'IP geolocation lookup failed');
    }

    res.json({
      ip: ip,
      country: response.data.country,
      region: response.data.regionName,
      city: response.data.city,
      isp: response.data.isp,
      coordinates: {
        latitude: response.data.lat,
        longitude: response.data.lon
      }
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      note: 'If no IP is provided, your current IP will be used'
    });
  }
});

app.post('/loghealth', (req, res) => {
  try {
    const { n: name, p: password, log } = req.query;

    if (!name || !password || !log) {
      throw new Error('Missing parameters. Required: n=name&p=password&log=log_entry');
    }

    if (!healthLogs.has(name)) {
      healthLogs.set(name, { password, logs: [] });
    }

    const user = healthLogs.get(name);
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    user.logs.push({
      timestamp: new Date().toISOString(),
      log: log
    });

    res.json({
      status: 'success',
      message: 'Health log added successfully',
      totalLogs: user.logs.length
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/getlog', (req, res) => {
  try {
    const { n: name, p: password } = req.query;

    if (!name || !password) {
      throw new Error('Missing parameters. Required: n=name&p=password');
    }

    if (!healthLogs.has(name)) {
      throw new Error('User not found');
    }

    const user = healthLogs.get(name);
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    res.json({
      status: 'success',
      logs: user.logs,
      totalLogs: user.logs.length
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    endpoints: {
      '/quote': 'GET - Random motivational quote',
      '/bmi?w=WEIGHT&h=HEIGHT&u=UNITS(m/i)&g=GENDER(m/f)&a=AGE': 'GET - Calculate BMI',
      '/geolocation?ip=IP': 'GET - Get geolocation info for IP',
      '/loghealth?n=NAME&p=PASSWORD&log=LOG': 'POST - Log health data',
      '/getlog?n=NAME&p=PASSWORD': 'GET - Get health logs'
    }
  });
});

app.listen(port,ip, () => {
  console.log(`Server running on http://localhost:${port}`);
});