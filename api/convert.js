import sharp from "sharp";

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // 画像取得
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch image" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // サイズ（32x32固定）
    const width = 32;
    const height = 32;

    // 画像処理（くっきり＋滑らか）
    const raw = await sharp(buffer)
      .resize(width, height, {
        fit: "fill",
        kernel: "lanczos3"
      })
      .normalize()
      .gamma(1.1)
      .raw()
      .toBuffer();

    const result = {};
    let index = 1;

    // RGB抽出
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 3;

        const r = raw[i];
        const g = raw[i + 1];
        const b = raw[i + 2];

        result[index++] = [r, g, b];
      }
    }

    return res.status(200).json({
      width,
      height,
      data: result
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
