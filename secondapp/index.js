const express = require("express");
const indexRouter = require("./routers/index");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

const PORT = process.env.PORT || 4000;
app.listen(PORT);
console.log(
  `=== Второй сервис COUNTER запущен на ${PORT} порту ===`
);
