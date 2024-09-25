import sqlite3 from "sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const route = path.resolve(__dirname, "../sources/website.db");
class DB {
  #db;
  open() {
    if (this.#db == undefined) {
      this.#db = new sqlite3.Database(route);
    }
    return this.#db;
  }

  async query(query, params = []) {
    const db = this.open();
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(query, [...params], (err, rows) => {
          if (!err)
            resolve({
              ready: true,
              rows: rows ?? [],
            });
          else {
            console.error(err);
            resolve({
              ready: false,
              rows: [],
            });
          }
        });
      });
    });
  }

  close() {
    if (this.#db != undefined) {
      this.#db.close();
      this.#db = undefined;
    }
  }
}

export default DB;