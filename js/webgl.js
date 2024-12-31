function generateFingerprintWebgl() {
  function getInfo() {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl");
  }
  const gl = getInfo();

  // 提取參數
  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  const version = gl.getParameter(gl.VERSION);

  // 繪製並提取像素數據
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("webgl");
  ctx.clearColor(0.5, 0.5, 0.5, 1.0); // 統一背景
  ctx.clear(ctx.COLOR_BUFFER_BIT);
  const pixelData = new Uint8Array(canvas.width * canvas.height * 4);
  ctx.readPixels(0, 0, canvas.width, canvas.height, ctx.RGBA, ctx.UNSIGNED_BYTE, pixelData);

  // 標準化與哈希
  const normalizedData = pixelData.map((val) => Math.round(val / 10) * 10); // 減少浮動影響
  console.log("pixelData", pixelData);
  console.log("normalizedData", normalizedData);
  const hashInput = [renderer, vendor, version, ...normalizedData].join("|");
  return hashInput;
}

function getWebGLInfo() {
  function getInfo() {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl");
  }
  const gl = getInfo();

  // 提取參數
  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  const version = gl.getParameter(gl.VERSION);
  return [renderer, vendor, version].join(" @@@ ");
}
