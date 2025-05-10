const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
const port = 5000;

// Configure SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'temperatures.db',
});

// Define Temperature model
const Temperature = sequelize.define('Temperature', {
  patient_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Sync database
sequelize.sync();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.post('/api/temperature', async (req, res) => {
  try {
    const { patient_id, temperature } = req.body;
    console.log(patient_id, temperature);
    await Temperature.create({ patient_id, temperature });
    res.json({ message: 'Data saved!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const allReadings = await Temperature.findAll({
      order: [['timestamp', 'ASC']],
    });

    allReadings.sort((a, b) => a.timestamp - b.timestamp);

    // Group readings by patient_id
    const patients = {};
    allReadings.forEach(reading => {
      const pid = reading.patient_id;
      if (!patients[pid]) patients[pid] = [];
      patients[pid].push(reading);
    });

    // For tables: Reverse each patient's array to show latest first
    Object.keys(patients).forEach(pid => {
      patients[pid].reverse();
    });

    res.render('dashboard', { patients });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// API endpoint to get latest data
app.get('/api/latest-data', async (req, res) => {
  try {
    const allReadings = await Temperature.findAll({
      order: [['timestamp', 'ASC']],
    });

    allReadings.sort((a, b) => a.timestamp - b.timestamp);

    // Group readings by patient_id
    const patients = {};
    allReadings.forEach(reading => {
      const pid = reading.patient_id;
      if (!patients[pid]) patients[pid] = [];
      patients[pid].push(reading);
    });

    res.json({ patients });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});