import "dotenv/config";
import { IOhlcvProps, TCandleType } from "../@types/ubit";
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
  df = getYesterDayMa(df, day);
  getBollingerBand(df, day);

  console.log(df);
};

const getCoinName = async () => {
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
};

/**
 * rsi 지표 구하기 (14봉 기준)
 */
function getRsi(df: IOhlcvProps[], maCount: number) {
  for (let i = df.length - 1; i > 0; i--) {
    df[i].rs = df[i].close - df[i - 1].close || 0; //  현재종가 - 전일종가
    df[i].rsiU = (df[i].rs || 0) > 0 ? df[i].rs : 0;
    df[i].rsiD = ((df[i].rs || 0) < 0 ? df[i].rs || 0 : 0) * -1;
  }
  let maSumPlus = 0;
  let maSumMinus = 0;
  // 15, 28
  for (let j = df.length - maCount; j < df.length; j++) {
    if (j === df.length - maCount) {
      // k > j - maCount  인지 k >= j - maCount 인지 검증할것!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      for (let k = j; k > j - maCount; k--) {
        maSumPlus += df[k].rsiU || 0; //  현재종가 - 전일종가
        maSumMinus += df[k].rsiD || 0;
      }
      df[j].rsiAU = maSumPlus / maCount;
      df[j].rsiDU = maSumMinus / maCount;
    } else {
      df[j].rsiAU =
        ((df[j - 1].rsiAU || 0) * (maCount - 1) + (df[j].rsiU || 0)) / 14;
      df[j].rsiDU =
        ((df[j - 1].rsiDU || 0) * (maCount - 1) + (df[j].rsiD || 0)) / 14;
    }
    df[j].rsi =
      ((df[j].rsiAU || 0) / ((df[j].rsiAU || 0) + (df[j].rsiDU || 0))) * 100;
    // console.log(maSumPlus, maSumMinus);
  }
  // for (let i = df.length - 1; i >= 0; i--) {
  //   if (i >= maCount - 1) {
  //     let maSumPlus = 0;
  //     let maSumMinus = 0;
  //     for (let j = i; j >= i - (maCount - 1); j--) {
  //       maSumPlus += (df[j].rs || 0) > 0 ? df[j].rs || 0 : 0; //  현재종가 - 전일종가
  //       maSumMinus += (df[j].rs || 0) < 0 ? df[j].rs || 0 : 0;
  //     }
  //     const rsiU = maSumPlus; // n일 동안의 종가 상승 분
  //     const rsiD = maSumMinus * -1; // n일 동안의 종가 하락 분 --> 음수를 양수로 바꿔줌
  //     const rsiAU = maSumPlus / maCount; // U값의 평균
  //     const rsiDU = (maSumMinus * -1) / maCount; // D값의 평균

  //     df[i].rsiU = rsiU; // n일 동안의 종가 상승 분
  //     df[i].rsiD = rsiD; // n일 동안의 종가 하락 분 --> 음수를 양수로 바꿔줌
  //     df[i].rsiAU = rsiAU; // U값의 평균
  //     df[i].rsiDU = rsiDU; // D값의 평균

  //     // df[i].rsi = (rsiAU / (rsiAU + rsiDU)) * 100;
  //     df[i].rsi = rsiAU / rsiDU / (1 + rsiAU / rsiDU);
  //   }
  // }
  return df;
}

(async () => {
  try {
    // const test = await request.get("https:/naver.com");
    // console.log(test);
    // await request.post(
    //   `https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`,
    //   {
    //     chat_id: TELEGRAM_CHAT_ID,
    //     message_id: 2434,
    //   }
    // );

    // const res: {
    //   data: { ok: boolean; result: IResultProps[] };
    // } = await Axios.get(
    //   `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates`
    // );
    // getTestBollinger(candleType, UBIT_COIN, day);
    // while (true) {
    //   let df = await get_ohlcvPlusOne("60", "KRW-BTC", 28);
    //   df = getYesterDayMa(df, 20);
    //   df = getBollingerBand(df, 20);
    //   df = getRsi(df, 14);
    //   console.log(df[df.length - 1].close, df[df.length - 1].rsi);
    //   await sleep(1000);
    // }

    let df = await get_ohlcvPlusOne("60", "KRW-BTC", 29);
    // console.log(df);
    for (const item of df) {
      console.log(item.close);
    }
  } catch (err) {
    console.log(err);
  }
})();
