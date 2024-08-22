import fs from "fs"

export function uploadToProd() {

    const products = fs.readFileSync("./products.json", "utf-8")

    fs.writeFileSync('../website-laptop-store/src/json.js', `export const data = ${products}`)
    
}