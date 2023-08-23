const express = require("express");
const router = express.Router();
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

// Создано приложение Node.js, обрабатывающее два роута:
//     увеличить счётчик POST /counter/:bookId/incr;
//     получить значение счётчика GET /counter/:bookId — приложение контейнеризировано.

router.get("/counter/:bookId", async (req, res) => {
  const { bookId } = req.params;
  console.log('ID ', bookId);
  let cnt = null;
  try {
    cnt = Number(await client.hGet("viewCount", String(bookId)));
    cnt = !cnt ? 1 : cnt + 1;

  } catch (e) {
    console.log(" Ошибка ", {
      errorcode: 500,
      errmassage: "error in radis second APP",
      err: e,
    });
  }
  
  console.log('555', cnt);
  res.status(200);
  res.json({ [bookId]: cnt });
});

router.post("/counter/:bookId/incr", async (req, res) => {
  const { bookId } = req.params;
  let status = 'Ok';
  try {
    await client.hSet("viewCount", String(bookId), req.body.count);
  } catch (e) {
    status = e.status;
    console.log('Ошибка HSET', {
      errorcode: 500,
      errmassage: 'error in radis second APP',
      err: e,
    });
  }
  res.status(200);
  res.json({ status });
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
//       errmassage: "error in radis",
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
//       errmassage: "error in radis 2",
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
//       errmassage: "error in radis 2",
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
