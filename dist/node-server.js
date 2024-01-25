require("http").createServer((req, res) => {
  const path = (req.url || "/").slice(1);
  if (path === "") {
    const buffer = require("fs").readFileSync("formas.htm.br");
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Encoding", "br");
    res.setHeader("Content-Length", buffer.byteLength);
    res.write(buffer);
  }
  res.end();
}).listen(1337);

console.log(`
Open http://localhost:1337 to watch formas by pestis

This mini http server is only here to pass the Content-Encoding we are missing on file:// compared to the normal environment of a web page
`);
