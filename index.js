const express = require("express");
const mongoose = require("mongoose");
const indexRouter = require("./routers/index");

const MONGO_URL = process.env.MONGO_URL || "localhost";
const MONGO_DB = "mydb";

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

const serverPort = process.env.PORT || 3000;
const PORT = serverPort;

(async () => {
  try {
    // { url: REDIS_URL }
    await mongoose.connect(`${MONGO_URL}:27017/${MONGO_DB}`);
    app.listen(PORT);
    console.log(
      `=== Основное приложение Express запущено на ${serverPort} порту ===`
    );
  } catch (e) {
    console.log(e);
  }
})();
