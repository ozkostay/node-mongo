const express = require("express");
// const mongoose = require("mongoose");
const indexRouter = require("./routers/index");
// const Books = require("./models/Books");

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

const PORT = process.env.PORT || 3000;
// MONGO_URL = process.env.MONGO_URL;
// MONGODB_NAME = process.env.MONGODB_NAME || "booksstor";

async function start() {
  // console.log("START MONGO WAY", `${MONGO_URL}/${MONGODB_NAME}`);
  try {
    // await mongoose.connect(`${MONGO_URL}/${MONGODB_NAME}`);
    // await mongoose.connect(`mongodb://localhost:27018/${MONGODB_NAME}`);
    // console.log("База MONGODB подключена!!!");
    app.listen(PORT, () => {
      console.log(
        `=== Основное приложение Express запущено на ${PORT} порту ===`
      );
    });
  } catch (e) {
    console.log({
      massage: "Ошибка при старте Первого приложения",
      error: e,
    });
  }
}

start();
