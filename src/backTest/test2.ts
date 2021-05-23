import "dotenv/config";
import { TCandleType } from "../@types/ubit";
import TelegramBot from "../telegram-bot";
import { getAllAccount, getMarketAllInfo } from "../ubit";
import {
  getAllMarketBy10,
  getBollingerBand,
  getTargetCoins,
  getYesterDayMa,
  get_ohlcvPlusOne,
} from "../util";

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = <string>process.env.TELEGRAM_CHAT_ID;
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID);

const days = 5;
const type = "240"; // "day"
const UBIT_COIN = String(process.env.UBIT_COIN);
const KRW = UBIT_COIN.split("-")[0];
const BTC = UBIT_COIN.split("-")[1];

const autoTrade = async () => {
  try {
    // 10개단위로 코인정보 가져오기
    const allMarket = await getAllMarketBy10();

    let targetCoins = await getTargetCoins(allMarket, type, days);
    const filtered = targetCoins.filter(
      (item) => item.targetPrice === item.currentPrice
    );
    console.log(filtered);
    await telegramBot.sendMessage("test");
  } catch (err) {
    console.log(err);
  }
};

const candleType: TCandleType = "240";
const day = 20;

const getTestBollinger = async (
  candleType: TCandleType,
  coin: string,
  day: number
) => {
  let df = await get_ohlcvPlusOne(candleType, coin, day);
  df = await getYesterDayMa(df, day);
  await getBollingerBand(df, day);

  console.log(df);
};

(async () => {
  // getTestBollinger(candleType, UBIT_COIN, day);
  const allCoins = (await getMarketAllInfo()).KRW;
  const myAllAcount = await getAllAccount();
  const my = myAllAcount.filter((item) => {
    for (let coin of allCoins) {
      console.log(coin);
      if (item.currency !== "KRW") {
        if (coin.market === `${item.unit_currency}-${item.currency}`) {
          return true;
        }
      }
    }
  });
  console.log(my);
})();
