import { getAllAccount, getApiKeyStatus, getOrderChance } from "./exchange-Api";
import {
  getDayCandles,
  getMarketAllInfo,
  getMinutesCandles,
  getOrderbook,
  getTicker,
} from "./quotation-Api";

export { getAllAccount, getOrderChance, getApiKeyStatus };
export {
  getMarketAllInfo,
  getTicker,
  getMinutesCandles,
  getDayCandles,
  getOrderbook,
};
