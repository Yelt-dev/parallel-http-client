import express from 'express';
import { promises as fs } from 'fs';
import axios from 'axios';
import portfinder from 'portfinder';
import ProgressBar from 'cli-progress';
import chalk from 'chalk';

const app = express();
let server;  // To store the reference to the server

/**
 * Executes HTTP requests defined in the input JSON file and writes the responses to the output JSON file.
 * @param {string} inputFilePath - Path to the input JSON file containing the requests.
 * @param {string} outputFilePath - Path to the output JSON file to save responses.
 */
async function makeRequests(inputFilePath, outputFilePath) {
  let bar;

  try {
    // Read the JSON file containing the requests
    const data = await fs.readFile(inputFilePath, 'utf8');
    const requests = JSON.parse(data);

    // Ensure the `requests` is an array
    if (!Array.isArray(requests)) {
      throw new Error('The JSON file must contain an array of requests.');
    }

    // Initialize progress bar
    bar = new ProgressBar.SingleBar({
      format: `${chalk.cyan('Progress:')} [{bar}] {percentage}% | {value}/{total} requests`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    }, ProgressBar.Presets.shades_classic);

    // Start the progress bar
    bar.start(requests.length, 0);

    // Map each request to an Axios call and return an array of promises
    const promises = requests.map(async (request, index) => {
      const { method, url, body, token } = request;

      // Set headers if a token is provided
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // Perform the HTTP request using Axios
        const response = await axios({
          method,
          url,
          data: body,
          headers,
        });

        // Update the progress bar
        bar.update(index + 1);

        // Return the request and response details
        return {
          request: {
            index,
            method,
            url,
            body,
            token
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
          }
        };
      } catch (error) {
        // Update the progress bar
        bar.update(index + 1);

        // Return the request and error details if an exception occurs
        return {
          request: {
            index,
            method,
            url,
            body,
            token
          },
          response: {
            status: error.response ? error.response.status : 'N/A',
            statusText: error.response ? error.response.statusText : error.message,
            data: error.response ? error.response.data : error.message,
            headers: error.response ? error.response.headers : {}
          }
        };
      }
    });

    // Execute all the requests in parallel and wait for them to complete
    const results = await Promise.all(promises);

    // Stop the progress bar
    bar.update(requests.length);
    bar.stop();

    // Write the results to the output JSON file
    await fs.writeFile(outputFilePath, JSON.stringify(results, null, 2), 'utf8');

    console.log(chalk.green('Responses saved to'), outputFilePath);
  } catch (error) {
    console.error(chalk.red('Error executing requests:'), error.message);
    if (bar) {
      bar.stop(); // Ensure the progress bar stops if an error occurs
    }
    throw error;
  }
}

/**
 * Starts the Express server, performs requests, and shuts down the server when done.
 */
async function startServer() {
  try {
    // Find an available port
    const port = await portfinder.getPortPromise();

    // Start the Express server
    server = app.listen(port, async () => {
      console.log(chalk.blue(`Server running on port ${port}`));

      try {
        // Execute the requests and close the server when done
        await makeRequests('./src/json/main-request.json', './src/json/main-response.json');
        server.close(() => {
          console.log(chalk.yellow('Server stopped'));
        });
      } catch (error) {
        console.error(chalk.red('Error performing requests:'), error.message);
        server.close(() => {
          console.log(chalk.yellow('Server stopped with errors'));
        });
      }
    });

  } catch (error) {
    console.error(chalk.red('Error starting the server:'), error.message);
  }
}

// Call startServer to initialize the application
startServer();







