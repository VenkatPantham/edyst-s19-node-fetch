const request = require("request");
const events = require("events");
const progressBarEmitter = new events.EventEmitter();
const ProgressBar = require("./ProgressBar");
const Bar = new ProgressBar();
const crypto = require("crypto");
var totalSize = 0;
var data = [];

class Downloader {
  fetch(start, end, url, size) {
    var options = {
      url: url,
      encoding: null,
      headers: {
        "User-Agent": "request",
        Range: "bytes=" + start + "-" + end
      }
    };
    let listener = function listener() {
      Bar.update(100);
      console.log("\n");
    };
    return new Promise(function(resolve, reject) {
      request.get(options, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          totalSize = totalSize + parseInt(resp.headers["content-length"]);
          progressBarEmitter.on("connection", listener);
          data.push(body);
          resolve(totalSize);
        }
      });
    });
  }

  async start(reqs, url, size) {
    var promises = [];
    Bar.init(100);
    var chunkSize = Math.ceil(size / reqs);
    for (var i = 0; i < reqs; i++) {
      if (i === 0) var start = i * chunkSize;
      else var start = i * chunkSize + 1;
      var end = (i + 1) * chunkSize;
      promises.push(await this.fetch(start, end, url, reqs, size));
    }
    Promise.all(promises)
      .then(function(result) {
        console.log("\nTotal bytes downloaded :", totalSize);
      })
      .catch(function(err) {
        console.log(err);
      });
    progressBarEmitter.emit("connection");
    let buf = new Buffer.concat(data);
    let hash = crypto
      .createHash("md5")
      .update(buf)
      .digest("hex");
    console.log("\n", hash);
  }
}

module.exports = Downloader;
