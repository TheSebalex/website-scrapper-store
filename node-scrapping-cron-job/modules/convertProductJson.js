import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config.json");

export async function convertProductJson(products, settings) {
  let productsOutput = [];

  for (const product of products) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const image = await Promise.all(
      product.img.map(
        async (item, i) =>{
          await new Promise(resolve => setTimeout(resolve, i * 500));
          return await fetch(item)
          .then(response => response.blob())
          .then(async blob => {
            const buffer = Buffer.from(await blob.arrayBuffer());
            const b64 = "data:" + blob.type + ';base64,' + buffer.toString('base64');
            return b64;
          })
        }
      )
    );

    productsOutput.push({
      ...product,
      img: image,
      url: undefined,
      price: product.price + settings.shipPrice + settings.extraPrice,
    });
  }

  productsOutput = orderByTitle(productsOutput, "title");

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
