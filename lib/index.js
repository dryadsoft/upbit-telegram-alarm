"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var node_telegram_api_1 = __importDefault(require("node-telegram-api"));
var node_upbit_1 = require("node-upbit");
var buttons_1 = require("./buttons");
var UBIT_ACCESS_KEY = String(process.env.UBIT_ACCESS_KEY);
var UBIT_SECRET_KEY = String(process.env.UBIT_SECRET_KEY);
var TELEGRAM_TOKEN = String(process.env.TELEGRAM_TOKEN);
var TELEGRAM_CHAT_ID = Number(process.env.TELEGRAM_CHAT_ID);
var quoationService = new node_upbit_1.QuoationService();
var utilsService = new node_upbit_1.UtilsService();
var telegramApi = new node_telegram_api_1.default(TELEGRAM_TOKEN, {
    polling: true,
    process: "parallel",
});
telegramApi.init(function (options) {
    options.isAlarmOn = false;
    options.candleType = "";
    options.allCoins = [];
    options.selectedCoins = [];
});
telegramApi.on("text", function (_a) {
    var chatId = _a.chatId, messageId = _a.messageId, text = _a.text, options = _a.options;
    return __awaiter(void 0, void 0, void 0, function () {
        var sendMsg, _b, _c, ilnileButton, ilnileButton2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    sendMsg = "";
                    _b = text;
                    switch (_b) {
                        case "/start": return [3, 1];
                        case "/알람 켜기": return [3, 3];
                        case "/알람 끄기": return [3, 5];
                        case "/코인선택": return [3, 7];
                        case "/캔들": return [3, 14];
                    }
                    return [3, 16];
                case 1:
                    sendMsg = "텔레그램 봇에 오신걸 환영합니다.";
                    return [4, telegramApi.sendKeyboardMessage(chatId, sendMsg, buttons_1.getStartKeyboard(options === null || options === void 0 ? void 0 : options.isAlarmOn))];
                case 2:
                    _d.sent();
                    return [3, 17];
                case 3:
                    sendMsg = "알람이 켜졌습니다";
                    options && (options.isAlarmOn = true);
                    return [4, telegramApi.sendKeyboardMessage(chatId, sendMsg, buttons_1.getStartKeyboard(options === null || options === void 0 ? void 0 : options.isAlarmOn))];
                case 4:
                    _d.sent();
                    return [3, 17];
                case 5:
                    sendMsg = "알람이 꺼졌습니다";
                    options && (options.isAlarmOn = false);
                    return [4, telegramApi.sendKeyboardMessage(chatId, sendMsg, buttons_1.getStartKeyboard(options === null || options === void 0 ? void 0 : options.isAlarmOn))];
                case 6:
                    _d.sent();
                    return [3, 17];
                case 7:
                    if (!options) return [3, 13];
                    options.selectedCoins = [];
                    _c = options;
                    return [4, quoationService.getMarketAllInfo()];
                case 8:
                    _c.allCoins = (_d.sent()).KRW;
                    return [4, buttons_1.coinsInlineButton(options.allCoins)];
                case 9:
                    ilnileButton = _d.sent();
                    sendMsg = "알람받을 코인을 선택하세요.";
                    return [4, telegramApi.sendInlineButtonMessage(chatId, sendMsg, ilnileButton)];
                case 10:
                    _d.sent();
                    return [4, buttons_1.coinsInlineButton(options.allCoins, 15)];
                case 11:
                    ilnileButton2 = _d.sent();
                    sendMsg = "알람받을 코인을 선택하세요.";
                    return [4, telegramApi.sendInlineButtonMessage(chatId, sendMsg, ilnileButton2)];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13: return [3, 17];
                case 14:
                    sendMsg = "캔들을 선택하십시오.";
                    return [4, telegramApi.sendInlineButtonMessage(chatId, sendMsg, buttons_1.candleInlineButton)];
                case 15:
                    _d.sent();
                    return [3, 17];
                case 16: return [2];
                case 17: return [2];
            }
        });
    });
});
telegramApi.on("callback", function (_a) {
    var chatId = _a.chatId, messageId = _a.messageId, text = _a.text, data = _a.data, options = _a.options;
    return __awaiter(void 0, void 0, void 0, function () {
        var sendMsg, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sendMsg = "";
                    _b = text;
                    switch (_b) {
                        case "알람받을 코인을 선택하세요.": return [3, 1];
                        case "캔들을 선택하십시오.": return [3, 10];
                    }
                    return [3, 13];
                case 1:
                    if (!(data === "confirm")) return [3, 8];
                    if (!(options && options.selectedCoins.length > 0)) return [3, 5];
                    options.selectedCoins = options.selectedCoins.map(function (selCoin) {
                        return options.allCoins.filter(function (coin) { return coin.market === selCoin; })[0];
                    });
                    sendMsg = "callback_data: " + options.selectedCoins;
                    return [4, telegramApi.deleteMessage(chatId, messageId - 1)];
                case 2:
                    _c.sent();
                    return [4, telegramApi.deleteMessage(chatId, messageId)];
                case 3:
                    _c.sent();
                    return [4, telegramApi.sendMessage(chatId, sendMsg)];
                case 4:
                    _c.sent();
                    return [3, 7];
                case 5:
                    sendMsg = "\uC120\uD0DD\uB41C \uCF54\uC778\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC120\uD0DD\uD574\uC8FC\uC138\uC694.";
                    return [4, telegramApi.sendMessage(chatId, sendMsg)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [3, 9];
                case 8:
                    options && options.selectedCoins.push(data);
                    _c.label = 9;
                case 9: return [3, 14];
                case 10:
                    options && (options.candleType = data);
                    sendMsg = data + " \uBD09\uC73C\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
                    return [4, telegramApi.deleteMessage(chatId, messageId)];
                case 11:
                    _c.sent();
                    return [4, telegramApi.sendMessage(chatId, sendMsg)];
                case 12:
                    _c.sent();
                    return [3, 14];
                case 13: return [2];
                case 14: return [2];
            }
        });
    });
});
var maCount = 20;
var type = "60";
var coin = "KRW-XRP";
(function () {
    setInterval(function () {
        var inter;
        if (!inter) {
            inter = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, telegramApi.asyncLog(300)];
                        case 1:
                            _a.sent();
                            return [4, telegramApi.sleep(3000)];
                        case 2:
                            _a.sent();
                            inter = null;
                            return [2];
                    }
                });
            }); }, 1000);
        }
    }, 1000);
})();
//# sourceMappingURL=index.js.map