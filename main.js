const Downloader = require("./Downloader");
const request = require("request");
let obj = new Downloader();

function main() {
  var reqs = process.argv[2];
  var url = process.argv[3];
  request(
    {
      url: url,
      method: "HEAD"
    },
    function(err, resp, body) {
      if (err) {
        console.log(err);
      } else {
        var size = resp.headers["content-length"];
        obj.start(reqs, url, size);
      }
    }
  );
}

main();
