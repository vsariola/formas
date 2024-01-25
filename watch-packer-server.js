const zlib = require("zlib");
const fs = require("fs");
const http = require("http");
const parser = require("./parser.js");
const optimize = require("./optimize.js");

const introPath = process.argv[2] || "formas.htm";
const introPathPacked = `${introPath}.br`;
const outputDir = "wip-packing";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log(`Watch, pack & serve - ${introPath}\n Usage: node ${__filename} formas.htm\n`);

let lastHash = -1;
const getBufferHash = input => {
  let hash = 0;
  input.forEach((v, i) => hash += v ^ i);
  return hash;
}

function numberToAlphabet(num) {
  let result = "";
  while (num >= 0) {
    result = String.fromCharCode(97 + num % 26) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

function* applymapping(state) {
  for (i = 0; i < state[0].length; i++) {
    if (state[0][i] instanceof parser.Identifier) {
      yield state[1][state[0][i].name];
    } else {
      yield state[0][i];
    }
  }
}

function print(state) {
  return [...applymapping(state)].join("");
}

function init_state(res) {
  idents = res.filter(e => e instanceof parser.Identifier).map(e => e.name);
  u = [...new Set(idents)];
  mapping = {};
  var j = 0;
  for (i = 0; i < u.length; i++) {
    var to;
    do {
      to = numberToAlphabet(j++);
    } while (parser.RESERVED.has(to));
    mapping[u[i]] = to;
  }
  return [res, mapping];
}

function mutate_func(state, r) {
  const [res, mapping] = state;
  const new_mapping = { ...mapping };
  const keys = Object.keys(mapping);
  var from;
  do {
    const keyIndex = (r() * keys.length) | 0;
    const key = keys[keyIndex];
    from = mapping[key];
  } while (parser.RESERVED.has(from));
  var to;
  do {
    to = numberToAlphabet((r() * 26) | 0);
  } while (parser.RESERVED.has(to) || to == from);
  for (const key in new_mapping) {
    value = new_mapping[key];
    if (value == from) {
      new_mapping[key] = to;
    } else if (value == to) {
      new_mapping[key] = from;
    }
  }
  return [res, new_mapping];
}

const packBuffer = async path => {
  const input = fs.readFileSync(path); 

  const res = parser.parse(input.toString());

  var state = init_state(res);

  const now = new Date();
  const prefix = `${outputDir
    }/intro-${now.getFullYear()
    }${("" + (now.getMonth() + 1)).padStart(2, "0")
    }${("" + now.getDate()).padStart(2, "0")
    }-${("" + now.getHours()).padStart(2, "0")
    }${("" + now.getMinutes()).padStart(2, "0")
    }${("" + now.getSeconds()).padStart(2, "0")
    }`;
  const origPath = `${prefix}.htm`;
  const minPath = `${prefix}.min.htm`;
  const packPath = `${prefix}.min.htm.br`;

  fs.writeFileSync(origPath, input);

  function cost_func(state, saveToDisk = false) {
    const code = print(state);
    const minified = Buffer.from(code, 'utf8');
    const packed = zlib.brotliCompressSync(minified, {
      chunkSize: 2 * 1024,
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: minified.byteLength
      }
    });

    if (saveToDisk) {
      fs.writeFileSync(minPath, minified);
      fs.writeFileSync(packPath, packed);
      fs.writeFileSync(introPathPacked, packed);
    }

    return packed.byteLength;
  }

  const best = optimize.dlas(state, cost_func, 5000, mutate_func);
  cost_func(best, true);

  return print(state);
};


let changeTimeout;
const changeTimeoutDelay = 250;
const packIntro = packBuffer.bind(this, introPath);
fs.watch(introPath, (eventType, filename) => {
  if (eventType === "change") {
    if (changeTimeout) { clearTimeout(changeTimeout); }
    changeTimeout = setTimeout(packIntro, changeTimeoutDelay);
  }
});

packIntro();

http.createServer((req, res) => {
  const path = (req.url || "/").slice(1);
  if (path === "") {
    const buffer = fs.readFileSync(introPathPacked);
    res.setHeader("Content-Encoding", "br");
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Length", buffer.byteLength);
    res.write(buffer);
  } else {
    res.setHeader("Content-Length", 0);
  }
  res.end();
}).listen(1337);

console.log(`Open http://localhost:1337 to view this 1kb intro - ${introPathPacked}`);
