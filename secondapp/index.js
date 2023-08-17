const express = require("express");
const indexRouter = require("./routers/index");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

const serverPort = process.env.PORT || 4000;
const PORT = serverPort;
app.listen(PORT);
console.log(
  `=== Второе приложение Express запущено на ${serverPort} порту ===`
);
