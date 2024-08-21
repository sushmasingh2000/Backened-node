const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

const allRoutes = require("./routes/Routes");
app.use("", allRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port truecoine.", process.env.PORT);
});
