RESERVED = new Set(["of", "id", "a", "c", "let", "performance", "AudioContext", "onmousemove", "Click", "onclick", "onkeyup", "querySelector", "getContext", "click", "canvas", "script", "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "continue", "const", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "while", "with", "alert", "arguments", "Array", "blur", "Boolean", "callee", "caller", "captureEvents", "clearInterval", "clearTimeout", "close", "closed", "confirm", "constructor", "Date", "defaultStatus", "document", "escape", "eval", "find", "focus", "frames", "Function", "history", "home", "Infinity", "innerHeight", "innerWidth", "isFinite", "isNaN", "java", "length", "location", "locationbar", "Math", "menubar", "moveBy", "name", "NaN", "netscape", "Number", "Object", "open", "opener", "outerHeight", "outerWidth", "Packages", "pageXOffset", "pageYOffset", "parent", "parseFloat", "parseInt", "personalbar", "print", "prompt", "prototype", "RegExp", "releaseEvents", "resizeBy", "resizeTo", "routeEvent", "scroll", "scrollbars", "scrollBy", "scrollTo", "self", "setInterval", "setTimeout", "status", "statusbar", "stop", "String", "toolbar", "top", "toString", "unescape", "unwatch", "valueOf", "watch", "window"]);

class Identifier {
    constructor(name) {
        this.name = name;
    }
}

function parseIdent(str, loc) {
    const identRegex = /([_a-zA-Z][a-zA-Z0-9_]*)/gy;
    identRegex.lastIndex = loc;
    const match = identRegex.exec(str);
    if (identRegex.lastIndex > 0) {
        const word = match[1];
        if (RESERVED.has(word)) {
            return [word, identRegex.lastIndex];
        }
        return [new Identifier(match[1]), identRegex.lastIndex];
    }
    return null;
}

function parseProperty(str, loc) {
    const propertyRegex = /(\.[a-zA-Z0-9_]+)/gy;
    propertyRegex.lastIndex = loc;
    const match = propertyRegex.exec(str);
    if (propertyRegex.lastIndex > 0) {
        return [match[1], propertyRegex.lastIndex];
    }
    return null;
}

function parseNumber(str, loc) {
    const numberRegex = /([0-9]+([eE][0-9]+)?)/gy;
    numberRegex.lastIndex = loc;
    const match = numberRegex.exec(str);
    if (numberRegex.lastIndex > 0) {
        return [match[1], numberRegex.lastIndex];
    }
    return null;
}

function parseString(str, loc) {
    const stringRegex = /(["'])(.*?)\1/gy
    stringRegex.lastIndex = loc;
    const match = stringRegex.exec(str);
    if (stringRegex.lastIndex > 0) {
        if (match[2])
            return ["'" + match[2] + "'", stringRegex.lastIndex];
        else
            return ["''", stringRegex.lastIndex];
    }
    return null;
}


function parseTemplate(str, loc) {
    const templateRegex = /`(.*)`/gy
    templateRegex.lastIndex = loc;
    const match = templateRegex.exec(str);
    if (templateRegex.lastIndex > 0) {
        var ret = ["`"];
        var interpolationRegex = /([^\$]*)(?:\$\{([^\}]*)\})?/y
        while (true) {
            var interpolations = interpolationRegex.exec(match[1]);
            if (typeof (ret[ret.length - 1]) == "string") {
                ret[ret.length - 1] += interpolations[1];
            } else {
                ret.push(interpolations[1]);
            }
            if (interpolations[2]) {
                if (typeof (ret[ret.length - 1]) == "string") {
                    ret[ret.length - 1] += "${";
                } else {
                    ret.push("${");
                }
                var inter = parse(interpolations[2]);
                ret.push(...inter);
                if (typeof (ret[ret.length - 1]) == "string") {
                    ret[ret.length - 1] += "}";
                } else {
                    ret.push("}");
                }
                continue;
            }
            break;
        }
        if (typeof (ret[ret.length - 1]) == "string") {
            ret[ret.length - 1] += "`";
        } else {
            ret.push("`");
        }
        return [ret, templateRegex.lastIndex];
    }
    return null;
}


const codeRegex = /([^\s])/gy
function parseCode(str, loc) {
    codeRegex.lastIndex = loc;
    const match = codeRegex.exec(str);
    if (codeRegex.lastIndex > 0) {
        return [match[1], codeRegex.lastIndex];
    }
    return null;
}

var whitespaceRegex = /\s/gy;
var commentRegex = /\/\/.*/gy;
function skipWSandComments(str, loc) {
    while (loc < str.length) {
        whitespaceRegex.lastIndex = loc;
        if (whitespaceRegex.exec(str)) {
            loc = whitespaceRegex.lastIndex;
            continue;
        }
        commentRegex.lastIndex = loc;
        if (commentRegex.exec(str)) {
            loc = commentRegex.lastIndex;
            continue;
        }
        break;
    }
    return loc;
}

var endsAlphaNumeric = /[_a-zA-Z0-9]$/;
var startsAlphaNumeric = /^[_a-zA-Z0-9]/;

function _merge(head, tail) {
    if (tail.length > 0) {
        var middle = tail[0];
        if (typeof (middle) == "string" && middle.startsWith('=new ')) {
            middle = ' = new ' + middle.slice(5); // this is a hack: ' = new ' is in the brotli dictionary
            tail[0] = middle;
        }
        if (typeof (middle) == "string" && middle.startsWith('}</script>')) {
            middle = '}\n</script>\n' + middle.slice(10); // this is a hack: '}\n</script>\n' is in the brotli dictionary
            tail[0] = middle;
        }
        if (typeof (middle) == "string" && middle.startsWith(')||')) {
            middle = ') || ' + middle.slice(3); // this is a hack: ') || ' is in the brotli dictionary
            tail[0] = middle;
        }
        if (typeof (middle) == "string" && middle.startsWith(".split('')")) {
            middle = '.split("")' + middle.slice(10);
        }
        // we will need a space between the two if they are both alphanumeric
        if ((head instanceof Identifier || endsAlphaNumeric.exec(head)) &&
            (middle instanceof Identifier || startsAlphaNumeric.exec(middle))) {
            if (typeof (head) == "string" && typeof (middle) == "string") {
                return [head + ' ' + middle, ...tail.slice(1)];
            }
            if (typeof (head) == "string") {
                return [head + ' ', ...tail];
            }
            return [head, ' ', ...tail]; // can this actually ever happen?
        }
        if (typeof (head) == "string" && typeof (middle) == "string") {
            if (head == '=' && middle.startsWith('Math')) {
                return [head + ' ' + middle, ...tail.slice(1)];
            } else {
                return [head + middle, ...tail.slice(1)];
            }
        }
    }
    return [head, ...tail];
}

function parse(str, loc = 0) {
    loc = skipWSandComments(str, loc);
    if (loc >= str.length) {
        return [];
    }
    const identmatch = parseIdent(str, loc);
    if (identmatch)
        return _merge(identmatch[0], parse(str, identmatch[1]));
    const propertymatch = parseProperty(str, loc);
    if (propertymatch)
        return _merge(propertymatch[0], parse(str, propertymatch[1]));
    const strmatch = parseString(str, loc);
    if (strmatch)
        return _merge(strmatch[0], parse(str, strmatch[1]));
    const templatematch = parseTemplate(str, loc);
    if (templatematch) {
        return templatematch[0].concat(parse(str, templatematch[1]));
    }
    const numbermatch = parseNumber(str, loc);
    if (numbermatch)
        return _merge(numbermatch[0], parse(str, numbermatch[1]));
    return _merge(str[loc], parse(str, loc + 1));
}

module.exports = {
    Identifier: Identifier,
    parse: parse,
    RESERVED: RESERVED,
};