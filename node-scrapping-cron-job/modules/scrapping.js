import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config.json");

export async function scrape(
  browser,
  url,
  scrappingTitleTerms,
  settings,
  userAgent,
) {
  let i = 0;
  while (i < 5) {
    try {
      await configBrowser(browser);
      i = 0;
      break;
    } catch (e) {
      i++;
      console.log(e);
    }
  }

  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  try{
    await page.waitForNetworkIdle({ idleTime: 10000});
  } catch(e) {}

  let existNextButtonBool = await existsNextButton(page);

  let products = [];

  while (existNextButtonBool) {
    await page.click('*[type="next"]:not([aria-disabled="true"])');
    await page.waitForNetworkIdle({ idleTimeout: 1000 });

    products = products.concat(
      await page.evaluate(
        (itmUrl, settings) => {
          const articles = document.querySelectorAll("article");

          return Array.from(articles)
            .map((article) => {
              const title = article.querySelector("h3")?.innerText;

              return {
                title: settings?.deleteTitleDescExpression
                  ? title
                      .replace(
                        new RegExp(settings.deleteTitleDescExpression),
                        ""
                      )
                      .replace("  ", " ")
                  : title,
                price:
                  parseInt(
                    article
                      .querySelector(
                        ".str-text-span.str-item-card__property-displayPrice"
                      )
                      ?.innerText?.replace(/[^0-9]/g, "")
                  ) / 100,
                url:
                  itmUrl +
                  JSON.parse(
                    article
                      ?.querySelector('div[role="button"]')
                      ?.getAttribute("data-track")
                  )?.eventProperty?.itm,
              };
            })
            .filter(
              (product) =>
                product.url &&
                product.title &&
                product.price &&
                product.price > 0
            );
        },
        config.ebayItmUrl,
        settings
      )
    );

    existNextButtonBool = await existsNextButton(page);
  }

  products = products.filter((product) => {
    return (
      scrappingTitleTerms.some((term) => {
        return product.title.includes(term);
      }) &&
      !settings.excludeTitleTerms.some((term) => {
        return product.title.includes(term);
      })
    );
  });

  let productTemp = [];

  for (const product of products) {
    let hasError = true;
    let countError = 0;

    while (hasError && countError < 3) {
      countError++;

      hasError = false;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const productPage = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        );

        await productPage.setViewport({
          width: 1080,
          height: 900,
          deviceScaleFactor: 1,
        });

        await productPage.goto(product.url, { waitUntil: "load" });

        productTemp.push({
          ...product,
          ...(await productPage
            .evaluate(() => {
              return {
                description: document.querySelector("#desc_ifr").src,
                img: Array.from(
                  document
                    .querySelector(
                      ".ux-image-carousel.zoom.img-transition-medium"
                    )
                    .querySelectorAll(
                      ".ux-image-carousel-item.image-treatment.image > img[data-zoom-src]"
                    )
                ).map((img) => img.getAttribute("data-zoom-src")),
              };
            })
            .then(async (data) => {
              await productPage.goto(data.description, {
                waitUntil: "domcontentloaded",
              });

              const desc = await productPage.evaluate(
                (selector) => {
                  return document.querySelector(selector)?.innerText ?? "";
                },
                [settings.descSelector]
              );

              data.description = desc;
              return data;
            })),
        });

        await productPage.close();
      } catch (e) {
        hasError = true;
      }
    }
  }

  products = productTemp;

  await page.close();
  return products;
}

async function configBrowser(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(config.configShipUrl, { waitUntil: "load" });
    await page
      .locator('*[aria-controls="gh-shipto-click-o"]')
      .click({ idleTimeout: 1000 });
    await page.waitForNetworkIdle({ idleTimeout: 1000 });

    await page.click('button[aria-label="Enviar a:"]');
    await page.waitForNetworkIdle({ idleTimeout: 1000 });

    await page.click(config.shipCountrySelector);
    await page.waitForNetworkIdle({ idleTimeout: 5000 });

    await page.click(".shipto__close-btn");
    await page.waitForNetworkIdle({ idleTimeout: 5000 });
  } catch (e) {
    console.log(e);
  }
  await page.close();
}

async function existsNextButton(page) {
  return await page.evaluate(() => {
    return document.querySelector('*[type="next"]:not([aria-disabled="true"])')
      ? true
      : false;
  });
}
