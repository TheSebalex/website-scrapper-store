import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config.json");

export async function convertProductJson(browser, products, settings) {
  const page = await browser.newPage();
  const productsOutput = [];

  await page.goto(config.configShipUrl);

  for (const product of products) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const image = await page.evaluate(
      async img => {
        return await Promise.all(
          img.map(
            async item =>
              await fetch(item)
                .then(res => res.blob())
                .then(async blob => {
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  return await new Promise(resolve => {
                    reader.onloadend = () => {
                      resolve(reader.result);
                    };
                  });
                })
          )
        );
      },
      [product.img]
    );

    productsOutput.push({
      ...product,
      img: image,
      url: undefined,
      price: product.price + settings.shipPrice + settings.extraPrice,
    });
  }

  await page.close();
  return productsOutput;
}
