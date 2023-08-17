const express = require("express");
const router = express.Router();
const Book = require("../store/Book");
// Для работы с файлами
const fileMulter = require("../middleware/file");
// Для работы с формами
const bodyParser = require("body-parser");
const urlebcodedparser = bodyParser.urlencoded({ extended: false });
// REDIS
const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL || "localhost";
const client = redis.createClient({ url: REDIS_URL });

(async () => {
  await client.connect();
})();

// STORE
const store = {
  // для начала добавим 2 объекта книги
  books: [new Book("1", "Название книги 1"), new Book("2", "Название книги 2")],
};

router.get("/", (req, res) => {
  res.render("index", {
    title: "Main PAGE",
    store: store.books,
  });
  console.log("Библиотека ", store.books);
});

router.get("/create", (req, res) => {
  // console.log('CREATE!!!');
  // ФОРМА Описываеи + кнопка закачки новой книги
  // По клику - router.post("/api/books/"
  res.render("create", {
    title: "CREATE PAGE",
    store: store.books,
  });
});

router.get("/view/:id", async (req, res) => {
  const { books } = store;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);
  let cnt = 0;
  if (idx !== -1) {
    // Увеличиваем счетчик  в redis
    try {
      cnt = Number(await client.hGet("viewCount", String(id))) + 1;
      await client.hSet("viewCount", String(id), cnt);
    } catch (e) {
      console.log(" Ошибка ", {
        errorcode: 500,
        errmassage: "error in radis",
        err: e,
      });
    }

    res.render("view", {
      title: "VIEW PAGE",
      item: books[idx],
      cnt: cnt,
    });
  } else {
    console.log("NOT found", id);
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

router.get("/update/:id", (req, res) => {
  const { books } = store;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);
  if (idx !== -1) {
    res.render("update", {
      title: "UPDATE PAGE",
      item: books[idx],
    });
  } else {
    console.log("NOT found", id);
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

router.get("/api/books", (req, res) => {
  // Главная страница
  const { books } = store;
  res.json(books);
});

router.post(
  "/api/books/",
  urlebcodedparser,
  fileMulter.single("fileBook"),
  (req, res) => {
    // Непосредственно запись в STATE новой книги
    const { books } = store;
    console.log("=============== ID ========== ", req.body.id);
    const {
      id,
      title = "Название книги",
      description,
      authors,
      favorite,
      fileCover,
      fileName = req.file.originalname,
      fileBook = req.file.filename,
    } = req.body;

    const newBook = new Book(
      id,
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName,
      fileBook
    );

    // Проверка - Редактирование или новая
    const idx = books.findIndex((el) => el.id === newBook.id);
    if (idx !== -1) {
      books.splice(idx, 1); // Удаляем существующую
    }

    books.push(newBook);
    res.status(201);
    res.redirect("/");
  }
);

router.post("/api/user/login", (req, res) => {
  // в этом проекте не надо, но оставил. НЕТ В ЗАДАНИИ!!!
  const returnObject = { id: 1, mail: "test@mail.ru" };
  res.status(201);
  res.json(returnObject);
});

router.get("/api/books/:id", (req, res) => {
  // просмотр текущей книги
  const { books } = store;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);

  if (idx !== -1) {
    res.json(books[idx]);
  } else {
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

router.put("/api/books/:id", (req, res) => {
  // Редактирование книги. НЕ В ЭТОЙ ВЕРСИИ!!! в формах метода PUT не предусмотрено
  const { books } = store;
  const { title, desc } = req.body;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);

  // Добавить поля
  if (idx !== -1) {
    books[idx] = {
      ...books[idx],
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName,
      fileBook,
    };

    res.json(books[idx]);
  } else {
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

router.post("/api/books/delete/:id", (req, res) => {
  // Удаляем книгу
  const { books } = store;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);
  if (idx !== -1) {
    books.splice(idx, 1);
    res.redirect("/");
  } else {
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

router.get("/api/books/:id/download", (req, res) => {
  // Здесь не надо, но оставил, пригодится :-)
  const { books } = store;
  const { id } = req.params;
  const idx = books.findIndex((el) => el.id === id);
  if (idx > -1) {
    res.status(201);
    const path =
      __dirname.slice(0, __dirname.lastIndexOf("/routers")) +
      `/public/books/${books[idx].fileBook}`;
    res.download(path, books[idx].fileBook, (err) => {
      if (err) {
        res.status(404).json({
          status: 404,
          errormsg: `Нет файла с ID=${id}`,
        });
      }
    });
  } else {
    res.status(500);
    res.json({
      status: 500,
      errormsg: `Нет файла с ID=${id}`,
    });
  }
});

module.exports = router;
