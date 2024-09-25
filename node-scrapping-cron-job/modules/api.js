import express from "express";
import DB from "./db.js";

import fs from "fs";

import imageType from "image-type";
import cors from "cors";

import sqlite3 from "sqlite3";
const sqlite = sqlite3.verbose();

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { B64Decode } from "./b64Decode.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function apiIndex(port) {
  const app = express();

  const existDB = fs.existsSync(path.join(__dirname, "../sources/website.db"));
  if (!existDB) {
    const newDB = new sqlite.Database(
      path.join(__dirname, "../sources/website.db")
    );
    // Lee el archivo create-database.sql y lo ejecuta en la base de datos creada.
    const SQL = fs.readFileSync(
      path.join(__dirname, "../sources/create-database.sql"),
      { encoding: "utf-8" }
    );

    await new Promise((resolve) => newDB.exec(SQL, resolve));
  }

  app.use(cors());

  app.get("/image/:id", async (req, res) => {
    const database = new DB();
    const id = req.params.id;

    const b64 = await database
      .query(`SELECT src FROM images WHERE id = ?`, [id])
      .then((data) => data.rows);

    if (b64.length > 0) {
      const buffer = await B64Decode(b64[0].src);

      if (buffer == null) return res.sendStatus(404);

      res.writeHead(200, {
        "Content-Type": await imageType(buffer).then((t) => t.mime),
        "Content-Length": buffer.length,
      });

      return res.end(buffer);
    } else return res.sendStatus(404);
  });

  app.get("/products", async (req, res) => {
    const database = new DB();

    let products = await database
      .query("SELECT * FROM products")
      .then((data) => data.rows)
      .catch((err) => console.error(err));

    products = await Promise.all(
      products.map(async (product) => ({
        ...product,

        img: await database
          .query(`SELECT id FROM images WHERE product_id = ?`, [product.id])
          .then((data) => data.rows.map((row) => row.id)),
      }))
    );

    res.json(products);
    database.close();
  });

  app.listen(port, () =>
    console.log(`Servidor corriendo en el puerto ${port}`)
  );
}
