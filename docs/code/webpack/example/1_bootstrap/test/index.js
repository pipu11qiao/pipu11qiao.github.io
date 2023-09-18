const memorize = require("webpack/lib/util/memoize");
require("./cat");

const fun = memorize(() => require("./cat"));

setTimeout(fun, 2000);
