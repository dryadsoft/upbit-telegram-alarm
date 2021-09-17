"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixed = exports.getDivByNum = void 0;
var getDivByNum = function (arrObj, num) {
    var resultObj = [];
    var tmp = [];
    arrObj.forEach(function (item, index) {
        var idx = Math.floor(index / num);
        if (index % num === 0) {
            tmp = [];
        }
        tmp.push(item);
        resultObj[idx] = tmp;
    });
    return resultObj;
};
exports.getDivByNum = getDivByNum;
var getFixed = function (num, digits) {
    if (!Number.isInteger(num)) {
        return parseFloat(num.toFixed(digits));
    }
    return num;
};
exports.getFixed = getFixed;
//# sourceMappingURL=index.js.map