import "dotenv/config";
import { alarmBollingerBand } from "./strategy/alarm-bollingerband";
import TelegramBot from "./telegram-bot";
import { asyncLog, getErrorMessage, sleep } from "./util";

// const strategy = { type_1: "auto-trade", type_2: "alarm-bollingerBand" };

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = <string>process.env.TELEGRAM_CHAT_ID;
// const CANDLE_TYPE = <TCandleType>process.env.CANDLE_TYPE;
// const DAYS = Number(<string>process.env.DAYS);

(async () => {
  try {
    const telegramBot = new TelegramBot(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID);
    await telegramBot.init({
      candleType: "60",
      days: 28,
    });
    telegramBot.watchChat();

    setTimeout(async () => {
      while (true) {
        const alarmOnOff = telegramBot.getAlarmOnOff();

        if (alarmOnOff === "on") {
          const { candleType, days, lowPersentage, arrCoin, allCoins, rsiHR } =
            telegramBot.getUpbitParam();
          // console.log(rsiHR);
          const arrMessage = await alarmBollingerBand(
            candleType,
            days,
            lowPersentage,
            arrCoin,
            allCoins,
            rsiHR
          );
          const msg = arrMessage.map(async (message) => {
            return await telegramBot.sendMessage(message);
          });
          // for (const message of arrMessage) {
          //   message !== "" && (await telegramBot.sendMessage(message));
          // }
          await Promise.all(msg);
        }
        await sleep(1000);
      }
    }, 0);
  } catch (err) {
    const errorMsg = getErrorMessage(err);
    await asyncLog(errorMsg);
    // await telegramBot.sendMessage(err);
  }
})();
