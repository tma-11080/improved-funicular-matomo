import sharp from "sharp";

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("return {error='no url'}");
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).send("return {error='failed fetch'}");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // ここ重要：nearestでくっきり
    const image = sharp(buffer).resize(32, 32, {
      fit: "fill",
      kernel: "nearest"
    });

    const raw = await image.raw().toBuffer();

    let data = {};
    for (let i = 0; i < raw.length; i += 3) {
      const index = (i / 3) + 1;
      data[index] = [raw[i], raw[i + 1], raw[i + 2]];
    }

    const result = {
      width: 32,
      height: 32,
      data
    };

    res.setHeader("Content-Type", "text/plain");
    res.send(`return ${JSON.stringify(result)}`);

  } catch (e) {
    res.status(500).send(`return {error="${e.message}"}`);
  }
}
