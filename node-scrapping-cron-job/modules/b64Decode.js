import zlib from "zlib";

export async function B64Decode(data) {
  if (!data) return null;
  
  const b64String = data.split(",")[1]; // Decodificar Base64 a binario
  let buffer = Buffer.from(b64String, "base64");
  buffer = await new Promise((resolve) =>
    zlib.gunzip(buffer, (err, decompressedData) => {
      resolve(decompressedData);
    })
  );
  return buffer;
}
