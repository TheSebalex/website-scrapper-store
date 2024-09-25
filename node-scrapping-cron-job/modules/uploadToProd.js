import fs from "fs";
import DB from "./db.js";

export async function uploadToProd() {
  let products = fs.readFileSync("./sources/products.json", "utf-8");

  products = JSON.parse(products).flat();

  const database = new DB();

  await database.query("DELETE FROM images").then(() => {
    database.query("DELETE FROM products").then(async () => {
      let i = 0;
      let j = 0;

      for (const product of products) {
        await database
          .query(
            "INSERT INTO products (id, title, price, description) VALUES (?, ?, ?, ?)",
            [i, product.title, product.price, product.description]
          )
          .then(async () => {

            for (const image of Array.isArray(product.img)
              ? product.img
              : [product.img]) {
              await database
                .query(
                  "INSERT INTO images (id, product_id, src) VALUES (?, ?, ?)",
                  [j, i, image]
                )
                .catch((err) => {
                  console.log(err);
                });
                j++;
            }
          });
        i++;
      }
    });
  });
  database.close();
}