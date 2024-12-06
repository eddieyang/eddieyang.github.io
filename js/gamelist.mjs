import fetch from 'node-fetch';
import XLSX from "xlsx";
import Workbook from "./Workbook.mjs";
import PQueue from 'p-queue';

const queue = new PQueue({concurrency: 8});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

function getUrl(page) {
  // 原始 URL
  let baseUrl = "https://www.tcgdemo.com/wps/relay/GCSGAME_gameList";

  // 初始化 URLSearchParams 物件
  let params = new URLSearchParams();
  params.set('clientType', '3');
  // params.set('platform', 'flash,html5-desktop');
  // params.set('merchant', 'wj33f2');
  // params.set('gameType', 'RNG');
  // params.set('gameClassify', 'Crash');
  params.set('pageNo', page);
  params.set('pageSize', '3000');
  params.set('language', 'EN');
  params.set('imgSize', 'rx2');

  // 組裝完整的 URL
  return `${baseUrl}?${params.toString()}`;
}

async function check200(url) {
  return fetch(url)
    .then(response => {
      return response.status;
    })
    .catch(error => {
      return 500;
    });
}

async function main(page) {
  const list = await fetch(getUrl(page), {
    "headers": {
      "language": "EN",
      "merchant": "tcgdemov3",
    },
    "body": null,
    "method": "GET",
  }).then(res => res.json());
  console.log("size", list.value.games.length, "totalPages", list.value.totalPages);
  //
  const records = [];
  const timer = setInterval(() => {
    console.log("do=", records.length, "page=", page)
  }, 1000);
  await Promise.all(list.value.games.map(async (game) => {
    return queue.add(async () => {
      if (!game.showIcon) return true;
      game.showIcon = game.showIcon.replace("images.b240784.com:42666", "images.6929183.com");
      const icon2 = game.showIcon.replace(/rx2\//, '');
      records.push([game.nodeId, game.roomId, game.vassalage, game.gameName || game.nodeName, game.showIcon, icon2, await check200(game.showIcon)])
      return true;
    })
  }))
  const output = [...records.filter(el => el[6] !== 200)];
  // console.log(output);

  const workbook = new Workbook();
  const headers = ["NodeId", "GameId", "Vassalage", "GameName", "Icon-長", "Icon-方", "Status"];

  if (output.length > 0) {
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...output]);
    workbook.appendSheet(sheet, `sheet${page}`);
  }
  workbook.writeFile(`missing${page}.xlsx`);
  clearInterval(timer);
  console.log("done")
}

// fetch
await main(3);
