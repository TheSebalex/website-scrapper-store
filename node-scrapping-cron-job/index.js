import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

import { convertProductJson } from "./modules/convertProductJson.js";
import { scrape } from "./modules/scrapping.js";

import { createRequire } from "module";
import { uploadToProd } from "./modules/uploadToProd.js";
const require = createRequire(import.meta.url);
const config = require("./config.json");

(async () => {
  cron.schedule(config.scrappingCron, async () => {
    while (true && (i ?? 0) < 5) {
      try {
        const browser = await puppeteer.launch({
          headless: false,
          args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
          ],
        });
        let outputStores = [];

        for (let store of config.scrappingStores) {
          console.log("Scrapping store: " + store.name);

          let scrapeResult = await scrape(
            browser,
            "https://www.ebay.com/str/sagesustainableelectronics?_ipg=72",
            store.scrappingTitleTerms,
            store
          );

          scrapeResult = await convertProductJson(
            browser,
            scrapeResult,
            config.scrappingStores[0]
          );
          outputStores.push(scrapeResult);
        }

        fs.writeFileSync("products.json", JSON.stringify(outputStores));

        uploadToProd();

        await browser.close();
        i = 0;
        break;
      } catch (e) {
        i++;
        console.log(e);
      }
    }
  });
})();
