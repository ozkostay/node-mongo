const express = require("express");
const indexRouter = require("./routers/index");

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

const serverPort = process.env.PORT || 3000;
const PORT = serverPort;
app.listen(PORT);
console.log(`=== Основное приложение Express запущено на ${serverPort} порту ===`);
