import sharp from "sharp";
import { copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const source = process.argv[2] || join(root, "public/logo.png");

async function removeBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const isNearBlack = max <= 35;
    const isDarkGrayBg = max <= 55 && max - min <= 12;
    if (isNearBlack || isDarkGrayBg) data[i + 3] = 0;
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

const logoPath = join(root, "public/logo.png");
const iconPath = join(root, "src/app/icon.png");
const appleIconPath = join(root, "src/app/apple-icon.png");

const png = await removeBackground(source);
await png.clone().toFile(logoPath);
await png
  .clone()
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toFile(iconPath);
copyFileSync(iconPath, appleIconPath);

console.log("Logo prepared:", logoPath);
