var p = require("./parser.js");

function deepEqual(x, y) {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
        (Object.keys(x).length === Object.keys(y).length) &&
        Object.keys(x).reduce(function (isEqual, key) {
            return isEqual && deepEqual(x[key], y[key]);
        }, true) : (x === y);
}

function testParse(str, expected) {
    const result = p.parse(str);
    console.assert(deepEqual(result, expected), `In ${str}, expected ${JSON.stringify(expected)} results, got ${JSON.stringify(result)}`);
}

testParse("_foo", [new p.Identifier("_foo")]);
testParse(" foo", [new p.Identifier("foo")]);
testParse(" _goo", [new p.Identifier("_goo")]);
testParse(" _goo // hello", [new p.Identifier("_goo")]);
testParse("//hello\n goo_", [new p.Identifier("goo_")]);
testParse("_a * b", [new p.Identifier("_a"), "*", new p.Identifier("b")]);
testParse("_a * b // comment", [new p.Identifier("_a"), "*", new p.Identifier("b")]);
testParse("//comment\n_a * b // comment", [new p.Identifier("_a"), "*", new p.Identifier("b")]);
testParse("'hello'", ["'hello'"]);
testParse("''", ["''"]);
testParse("' hello'", ["' hello'"]);
testParse("\" hello\"", ["' hello'"]);
testParse("a* b", [new p.Identifier("a"), "*", new p.Identifier("b")]);
testParse(" a  * b", [new p.Identifier("a"), "*", new p.Identifier("b")]);
testParse("function       a(){}", ["function ", new p.Identifier("a"), "(){}"]);
testParse("`hello${s}`", ["`hello${", new p.Identifier("s"), "}`"]);
testParse("`hello${s}${a}`", ["`hello${", new p.Identifier("s"), "}${", new p.Identifier("a"), "}`"]);