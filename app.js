import "dotenv/config";

import express from "express";
import path from "path";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import axios from "axios";

const app = express();

// view engine setup
app.set(
  "views",
  path.join(path.dirname(new URL(import.meta.url).pathname), "views")
);

app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  express.static(
    path.join(path.dirname(new URL(import.meta.url).pathname), "public")
  )
);

app.use((req, res, next) => {
  res.status(403).send("Forbidden");
});

// Function to send requests
async function sendRequests() {
  const urlsList = process.env.LIST_OF_URL;
  const urls = urlsList.split(",");
  try {
    // Loop through the list of URLs and send a request to each one
    urls.map(async (url) => {
      console.log(`Sending request to ${url}`);
      const response = await axios.get(url);

      if (response.status === 200) {
        console.log(`Request to ${url} was successful`);
      } else {
        console.error(
          `Request to ${url} failed with status ${response.status}`
        );
      }
    });
    console.log("Requests sent successfully");
  } catch (error) {
    console.error("Error sending requests:", error);
  }
}

// Set interval to call sendRequests
const interval = process.env.INTERVAL_TIME;
setInterval(sendRequests, interval);

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
