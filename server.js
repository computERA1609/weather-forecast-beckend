const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// CORS settings

var corsOptions = {
  origin: '*',
  allowedHeaders: "Content-Type, Accept, Authorization",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}

app.use(cors(corsOptions)); 

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/weather_app', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to the database');
  
})
.catch(error => {
  console.error('Error connecting to the database:', error);
});

// Define Weather Schema
const weatherSchema = new mongoose.Schema({
  city: {
    type: String,
    uppercase: true
 },
  temperature: Number,
  condition: String,
  date: {
    type: Date,
		default: Date.now,
  }
});

const Weather = mongoose.model('Weather', weatherSchema);

app.get('/api/weather-search/:city', async (req, res) => {
  const { city } = req.params;
  console.log('city', city);
  try {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c53eb149babf9468ef69f14e0494ee12&units=metric`);
    const data = await response.json();
    console.log('data', data);

    const weatherData = { 
      city, 
      temperature: data.main.temp,
      condition: data.weather[0].description,
      date: new Date().toISOString()
    };
    
    console.log('weatherData', weatherData);
    
    await Weather.findOneAndUpdate({ city }, weatherData, { upsert: true, new: true,  })
    .then(async data => {
  
      return res.status(200).json({
        success: true,
      });
    }).catch(err => {
      console.log(err)
      return res.status(200).json({
        success: false,
      })
    })
    

  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});



app.get('/api/weather', async (req, res) => {
  const weatherData = await Weather.find();

  console.log('weatherData',weatherData)
  return res.status(200).json({
    success: true,
    data: weatherData,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
