const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000; // You can change this port if necessary

// Use CORS middleware to allow requests from anywhere
app.use(cors()); // This will allow all domains to access your API

// API route to get transcript
app.get('/api/getTranscript/:videoId', (req, res) => {
  // Extract videoId from route parameters
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  const url = `https://youtubetotranscript.com/transcript?v=${videoId}&current_language_code=en`;

  axios.get(url)
    .then((response) => {
      const $ = cheerio.load(response.data);

      // Array to store the extracted data
      let transcriptData = [];

      // Select all span elements with the class 'transcript-segment' inside the <p> element
      $('p.inline.NA.text-primary-content span.transcript-segment').each((index, element) => {
        // Extract data-start, data-duration, and text from each span
        const start = $(element).attr('data-start');
        const duration = $(element).attr('data-duration');
        const text = $(element).text().trim();

        // Push the extracted information into the array as an object
        transcriptData.push({
          data_start: start,
          data_duration: duration,
          text: text
        });
      });

      // Send the extracted data as JSON response
      res.json(transcriptData);
    })
    .catch((error) => {
      console.error('Error fetching the URL:', error);
      res.status(500).json({ error: 'Error fetching the transcript' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
