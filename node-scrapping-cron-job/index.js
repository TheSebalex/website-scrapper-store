import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

import { convertProductJson } from "./modules/convertProductJson.js";
import { scrape } from "./modules/scrapping.js";

import { createRequire } from "module";
import { uploadToProd } from "./modules/uploadToProd.js";
const require = createRequire(import.meta.url);
const config = require("./config.json");

let task;

(async () => {
  cron.schedule(config.scrappingCron, scrappingTask);
  scrappingTask();
})();

async function scrappingTask() {
  let i = 0;
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
  while ((i ?? 0) < 5) {
    try {
      let outputStores = [];

      for (let store of config.scrappingStores) {
        console.log("Scrapping store: " + store.name);

        let scrapeResult = await scrape(
          browser,
          store.url,
          store.scrappingTitleTerms,
          store
        );

        scrapeResult = await convertProductJson(scrapeResult, store);
        outputStores.push(scrapeResult);
      }

      fs.writeFileSync("products.json", JSON.stringify(outputStores));

      uploadToProd();

      i = 0;
      break;
    } catch (e) {
      i++;
      console.log(e);
    }
  }
  await browser.close();
}
