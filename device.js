async function doubleHashID(input) {
  // 使用 SHA-256 對輸入進行第一次雜湊運算
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));

  // 將雜湊結果轉換為字節數組
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // 將每個字節轉換為十六進制字符串，並拼接為一個長字符串
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  // 截取前 8 位作為第一部分 ID
  const shortHash = hashHex.substring(0, 8);

  // 第二部分：對短哈希進行進一步處理，生成簡化雜湊值
  let hashSum = 0;
  for (let i = 0; i < shortHash.length; i++) {
    const charCode = shortHash.charCodeAt(i); // 獲取字符的 ASCII 值
    hashSum = (hashSum << 5) - hashSum + charCode; // 哈希算法：左移 5 位並加上當前字符值
    hashSum |= 0; // 強制將結果限制在 32 位整數範圍內
  }

  // 將絕對值轉換為十六進制字符串，並截取前 8 位
  const simplifiedHash = Math.abs(hashSum).toString(16).substring(0, 8);

  // 將第一部分和第二部分拼接，生成最終的雙哈希 ID
  return shortHash + simplifiedHash;
}

function getBrowserFingerprint(useCanvas = true) {
  const components = [];

  // 添加用戶代理字符串
  components.push(navigator.userAgent);

  // 添加平台信息（如 Windows、Mac、Linux 等）
  components.push(navigator.platform);

  // 添加屏幕分辨率（寬度 x 高度）
  components.push(screen.width + "x" + screen.height);

  // 添加顏色深度（每像素的位數，例如 24 或 32）
  components.push(screen.colorDepth);

  // 添加當前時間的時區偏移量（分鐘）
  components.push(new Date().getTimezoneOffset());

  // 添加語言設置（如果有多語言，則使用逗號分隔）
  if (navigator.languages) {
    components.push(navigator.languages.join(", "));
  } else {
    components.push(navigator.language); // 如果語言陣列不可用，則使用單一語言
  }

  // 添加瀏覽器插件列表
  if (navigator.plugins) {
    const pluginNames = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      pluginNames.push(navigator.plugins[i].name);
    }
    components.push(pluginNames.join(", "));
  }

  if (useCanvas) {
    // 添加畫布指紋（基於 Canvas 的唯一性特徵）
    components.push(getCanvasFingerprint());
  }

  // 將所有特徵組合為單一字符串，使用 "###" 分隔
  return components.join("  @@@  ");
}

function getCanvasFingerprint() {
  // 創建一個隱藏的 <canvas> 元素
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d"); // 獲取 2D 畫布上下文

  // 設置填充樣式並繪製矩形
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)"; // 半透明綠色
  ctx.fillRect(125, 1, 62, 20); // 繪製一個矩形

  // 設置文字樣式並繪製文字
  ctx.fillStyle = "#069"; // 深藍色
  ctx.font = "16px Arial"; // 字體樣式
  ctx.fillText("Hello, world!", 2, 15); // 繪製文本

  // 再次繪製文字以強調變化
  ctx.fillStyle = "#f60"; // 橙色
  ctx.fillText("Hello, world!", 4, 17); // 偏移一點位置

  // 將畫布的像素數據轉換為 Base64 編碼的數據 URL
  return canvas.toDataURL();
}
