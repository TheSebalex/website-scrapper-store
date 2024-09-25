import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config.json");
import sharp from "sharp";
import zlib from "zlib";

/**
 * Converts the output of the scrapping function into a JSON object to be written to a file.
 * @param {Object[]} products The output of the scrapping function.
 * @param {Object} settings The settings object from the config.
 * @returns {Promise<Object[]>} The converted products.
 */

export async function convertProductJson(products, settings) {
  let productsOutput = [];

  let percent = 0;
  const onePercent = 100 / products.length;

  let loader = setInterval(()=>{
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`[ ${percent.toFixed(2)}% ]`);
  }, 100)

  for (const product of products) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const image = await Promise.all(
      product.img.map(async (item, i) => {
        await new Promise((resolve) => setTimeout(resolve, i * 500));
        try {
          return await fetch(item)
            .then((response) => response.blob())
            .then(async (blob) => {
              let buffer = Buffer.from(await blob.arrayBuffer());

              buffer = await sharp(buffer)
              .resize({width: 600})
              .jpeg()
              .toBuffer()
              
              buffer = await new Promise(resolve => zlib.gzip(buffer, (err, bff) => {
                if (err) {
                  console.log(err);
                  resolve(buffer)
                } else {
                  resolve(bff)
                }
              }));

              const b64 =
                "data:" + blob.type + ";base64," + buffer.toString("base64");

                percent += onePercent;

              return b64;
            });
        } catch (e) {
          console.log(e);
          return undefined;
        }
      }).filter(x => x)
    );

    productsOutput.push({
      ...product,
      img: image,
      url: undefined,
      price: product.price + settings.shipPrice + settings.extraPrice,
    });
  }

  productsOutput = orderByTitle(productsOutput, "title");
  
  clearInterval(loader);

  return productsOutput;
}

function orderByTitle(arr, value) {
  return arr.sort((a, b) => {
    if (a[value] < b[value]) {
      return -1;
    }
    if (a[value] > b[value]) {
      return 1;
    }
    return 0;
  });
}
