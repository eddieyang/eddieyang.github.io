import {Blob} from 'node:buffer';
import XLSX from "xlsx";

export default class Workbook {
  constructor() {
    // 使用單例模式，產生唯一的 workbook
    if (!(this instanceof Workbook)) return new Workbook();

    /**
     * SheetNames 與 Sheets 兩者在 Workbook 中不可或缺，
     * 此為 XLSX 工具將 Workbook Object 傳為 Excel blob 時提取資料的位置。
     **/
    this.SheetNames = []; // 儲存 Sheet 的名稱。
    this.Sheets = {};     // 儲存 Sheet 的物件內容

    // 自定義 workbook optional object。
    this.wopts = {
      bookType: 'xlsx', // 要生成的文件類型
      bookSST: false,   // 是否生成 Shared String Table。官方解釋是如果開啟生成速度會下降，但在低版本IOS設備上有更好的兼容性
      type: 'binary'
    };
  }

  /**
   * 塞入 Sheet
   */
  appendSheet(sheet, name = `sheet${this.SheetNames.length + 1}`) {
    this.SheetNames = [...this.SheetNames, name];
    this.Sheets[name] = sheet;
  }



  toBlob(option = this.wopts) {
    // 字串轉 ArrayBuffer
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    var wbout = XLSX.write(this, option);
    var blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'});

    return blob;
  }

  writeFile(filename) {
    return XLSX.writeFile(this, filename);
  }

  isEmpty() {
    return !this.SheetNames.length && JSON.stringify(this.Sheets === "{}");
  }
}
