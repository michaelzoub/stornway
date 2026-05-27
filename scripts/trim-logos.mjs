import sharp from "sharp";
import { writeFile, unlink, rename } from "node:fs/promises";
import path from "node:path";

async function knockOutBlack(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r < 40 && g < 40 && b < 40) {
      data[i + 3] = 0;
    }
  }

  const tempPath = inputPath.replace(".png", ".tmp.png");

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(tempPath);

  await unlink(inputPath);
  await rename(tempPath, inputPath);
}

async function trimLogo(inputPath) {
  const tempPath = inputPath.replace(".png", ".trimmed.png");
  const info = await sharp(inputPath).trim({ threshold: 12 }).toFile(tempPath);
  await unlink(inputPath);
  await rename(tempPath, inputPath);
  return info;
}

const logo1Path = path.join("public", "stornwaylogo1.png");
await knockOutBlack(logo1Path);
const logo1 = await trimLogo(logo1Path);
console.log(`stornwaylogo1.png: ${logo1.width}x${logo1.height}`);

async function buildLogo2FromLogo1() {
  const moss = { r: 15, g: 27, b: 8 };
  const { data, info } = await sharp(logo1Path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    if (alpha > 40) {
      data[i] = moss.r;
      data[i + 1] = moss.g;
      data[i + 2] = moss.b;
      data[i + 3] = alpha;
    } else {
      data[i + 3] = 0;
    }
  }

  const logo2Path = path.join("public", "stornwaylogo2.png");
  const tempPath = logo2Path.replace(".png", ".tmp.png");

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(tempPath);

  const logo2 = await sharp(tempPath).trim({ threshold: 12 }).toFile(logo2Path);
  await unlink(tempPath);
  return logo2;
}

const logo2 = await buildLogo2FromLogo1();
console.log(`stornwaylogo2.png: ${logo2.width}x${logo2.height}`);
