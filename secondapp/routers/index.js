const express = require("express");
const router = express.Router();
const Books = require("../models/Books");
// Для работы с формами
// const bodyParser = require("body-parser");
// const urlencodedparser = bodyParser.urlencoded({ extended: false });

// REDIS
const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost";
console.log("REDIS_URL", REDIS_URL);
const client = redis.createClient({ url: REDIS_URL });

(async () => {
  await client.connect();
})();

// Routes MONGO DB
router.get("/api/books", async (req, res) => {
  try {
    const books = await Books.find();
    res.status("200");
    res.json({ message: "route GET/api/books", books: books });
  } catch {
    res.status("500");
    res.json({ message: "ERROR FROM route GET/api/books" });
  }
});

router.get("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  console.log("======== id", id);
  try {
    const book = await Books.findById(id);
    res.status("200");
    res.json({ message: "route GET/api/books/:id", book: book });
  } catch {
    res.status("404");
    res.json({ message: `Книга с id=${id} не найдена` });
  }
});

router.post("/api/books", async (req, res) => {
  try {
    const newBook = new Books({
      title: "Книга 1",
      description: "Какоето описание книги",
      authors: "Пушкин А.С.",
      favorite: "Файвориты",
      fileCover: "Обложка",
      fileName: "FileName.pdf",
    });
    const book = await newBook.save();
    res.status("200");
    res.json({ message: "route POST/api/books", book: book });
  } catch {
    res.status("500");
    res.json({ message: "ERROR FROM route POST /api/books" });
  }
});

router.put("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const update = {
    title: "Книга New",
    description: "Какоето описание книги New",
  };
  try {
    const book = await Books.findByIdAndUpdate(id, update);
    res.status("200");
    res.json({ message: "route PUT /api/books/id", books: book });
  } catch {
    res.status("404");
    res.json({ message: `Книга с id=${id} не найдена` });
  }
});

router.delete("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: id };
  try {
    const book = await Books.deleteOne(filter);
    res.status("200");
    res.json({ message: "OK", book: book });
  } catch {
    res.status("500");
    res.json({ message: "ERROR FROM route DELETE /api/books/:id" });
  }
});

// Роуты с REDIS
router.get("/counter/:bookId", async (req, res) => {
  const { bookId } = req.params;
  console.log("ID ", bookId);
  let cnt = null;
  try {
    cnt = Number(await client.hGet("viewCount", String(bookId)));
    // cnt = !cnt ? 1 : cnt + 1;
  } catch (e) {
    console.log(" Ошибка ", {
      errorcode: 500,
      errmessage: "error in radis second APP",
      err: e,
    });
  }

  console.log("555", cnt);
  res.status(200);
  res.json({ [bookId]: cnt });
});

router.post("/counter/:bookId/incr", async (req, res) => {
  const { bookId } = req.params;
  let status = "Ok";
  let cnt = null;
  try {
    cnt = Number(await client.hGet("viewCount", String(bookId)));
    cnt = !cnt ? 0 : cnt;
    console.log("текущее значение счетчика по ID", cnt);
    await client.hSet("viewCount", String(bookId), cnt + 1);
  } catch (e) {
    status = e.status;
    console.log("Ошибка POST in REDIS", {
      errorcode: 500,
      errmessage: "error in radis second APP",
      err: e,
    });
  }
  res.status(200);
  res.json({ status, cnt: cnt });
});

// // /============================================================================
// router.get("/", async (req, res) => {
//   let allKeys = null;
//   try {
//     allKeys = await client.hKeys("viewCount");
//     console.log("allKeys", allKeys, typeof allKeys);
//   } catch (e) {
//     console.log(" Ошибка ", {
//       errorcode: 500,
//       errmessage: "error in radis",
//       err: e,
//     });
//   }
//   res.render("index", {
//     title: "APP2 Main PAGE",
//     allKeys: allKeys,
//     cnt: null,
//   });
// });

// router.get("/clear-redis", async (req, res) => {
//   console.log("ROUTE /clear-redis");
//   try {
//     await client.del("viewCount");
//   } catch (e) {
//     console.log(" Ошибка удаления в REDIS", {
//       errorcode: 500,
//       errmessage: "error in radis 2",
//       err: e,
//     });
//   }
//   res.status(201);
//   res.redirect("/");
// });

// router.post("/get-count", urlencodedparser, async (req, res) => {
//   console.log("REQ", req.body);
//   console.log("REQ getvalue ===== ", req.body.getvalue);
//   console.log("REQ increment ===== ", req.body.increment);
//   const id = req.body.sel;
//   console.log("ID", id);
//   let cnt = null;
//   try {
//     if (req.body.getvalue === "1") {
//       cnt = await client.hGet("viewCount", id);
//     } else if (req.body.increment === "1") {
//       cnt = Number(await client.hGet("viewCount", String(id))) + 1;
//       await client.hSet("viewCount", String(id), cnt);
//     } else {
//       console.log("Третий вариант");
//     }
//     allKeys = await client.hKeys("viewCount");
//     console.log(`Всего ${cnt} просмотров`);
//   } catch (e) {
//     console.log(" Ошибка получения в REDIS", {
//       errorcode: 500,
//       errmessage: "error in radis 2",
//       err: e,
//     });
//   }

//   res.status(201);
//   res.render("index", {
//     title: "APP2 Main PAGE",
//     allKeys: allKeys,
//     cnt: cnt,
//   });
// });

module.exports = router;
