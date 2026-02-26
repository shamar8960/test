export default async function handler(req, res) {
  const { codes } = req.query;
  if (!codes) {
    return res.status(400).json({ error: "缺少股票代码" });
  }

  const secids = codes.split(",").map(code => {
    const market = code.startsWith("6") ? "1" : "0";
    return `${market}.${code}`;
  }).join(",");

  const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?
    fltt=2
    &invt=2
    &fields=f12,f14,f2,f3,f5,f31,f32,f127
    &secids=${secids}`.replace(/\s+/g, "");

  try {
    const r = await fetch(url);
    const json = await r.json();

    const result = json.data.diff.map(i => ({
      code: i.f12,
      name: i.f14,
      price: i.f2,
      pct: i.f3,
      volume: i.f5,
      buy1: i.f31,
      sell1: i.f32,
      inner: i.f127?.inner || 0,
      outer: i.f127?.outer || 0
    }));

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "行情获取失败" });
  }
}