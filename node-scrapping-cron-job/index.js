import fs from "fs";
import cron from "node-cron";

import { convertProductJson } from "./modules/convertProductJson.js";
import { scrape } from "./modules/scrapping.js";

import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";

puppeteerExtra.use(Stealth());

import { createRequire } from "module";
import { uploadToProd } from "./modules/uploadToProd.js";
import apiIndex from "./modules/api.js";
const require = createRequire(import.meta.url);
const config = require("./config.json");

let executing = false;

(async () => {
  cron.schedule(config.scrappingCron, scrappingTask);

  apiIndex(config.apiPort);

  if(config.startAppScrapping) scrappingTask();
})();

async function scrappingTask() {
  if (executing) return;
  executing = true;

  let i = 0;

  const browser = await puppeteerExtra.launch({
    headless: !config.showBrowser,
    protocolTimeout: 300000,
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
          store,
          config.userAgent,
        );

        console.log("Converting products");
        scrapeResult = await convertProductJson(scrapeResult, store);
        outputStores.push(scrapeResult);
      }

      fs.writeFileSync("products.json", JSON.stringify(outputStores));

      console.log("Uploading to prod");
      await uploadToProd();

      i = 0;
      break;
    } catch (e) {
      i++;
      console.log(e);
    }
  }

  console.log("Closing browser");
  console.log("---------- Finished ---------- \n");
  await browser.close();
  executing = false;
}
