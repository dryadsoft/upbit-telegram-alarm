import { IMarketCoinProps, TCandleType } from "../@types/ubit";
import {
  calcOfYield,
  getBollingerBand,
  getFixed,
  getYesterDayMa,
  get_ohlcvPlusOne,
  localeString,
  sleep,
} from "../util";

interface ITotalCoinsProps {
  market: string;
  close: number;
  bollingerHigh: number;
  maAvg: number;
  bollingerLow: number;
}
export const alarmBollingerBand = async (
  candleType: TCandleType,
  day: number,
  lowPersentage = 0,
  arrCoin: any,
  allCoins: IMarketCoinProps[]
) => {
  try {
    let totalCoins: ITotalCoinsProps[] = [];
    for (let i = 0; i < arrCoin.length; i++) {
      const getTargetCoins: ITotalCoinsProps[] = arrCoin[i].map(
        async (item: string) => {
          if (i > 0) {
            console.log(i);
            await sleep(1000);
          }
          let df = await get_ohlcvPlusOne(candleType, item, day);
          df = await getYesterDayMa(df, day);
          df = await getBollingerBand(df, day);

          const lastIndex = df.length - 1;
          const market = df[lastIndex].market;
          const close = getFixed(df[lastIndex].close, 3);
          const bollingerHigh = getFixed(
            <number>df[lastIndex].bollingerHigh,
            3
          );
          const maAvg = getFixed(<number>df[lastIndex].maAvg, 3);
          const bollingerLow = getFixed(<number>df[lastIndex].bollingerLow, 3);
          return {
            market,
            close,
            bollingerHigh,
            maAvg,
            bollingerLow,
          };
        }
      );
      const result = await Promise.all(getTargetCoins);
      // console.log(result);
      // totalCoins.push(result);
      totalCoins = [...totalCoins, ...result];
    }
    // console.log(totalCoins);

    const arrResultMessage = totalCoins.map((coinInfo) => {
      // console.log(
      //   localeString(calcOfYield(bollingerLow, lowPersentage)),
      //   localeString(bollingerLow)
      // );
      let message = "";
      if (coinInfo.close <= calcOfYield(coinInfo.bollingerLow, lowPersentage)) {
        const coin_koreanName = allCoins.filter(
          (coin) => coin.market === coinInfo.market
        )[0].korean_name;
        message = "볼린저밴드 low값 밑으로 내려감" + "\n";
        message += `코인: ${coin_koreanName}` + "\n";
        message += `현재가: ${localeString(coinInfo.close)}` + "\n";
        message += `볼밴 H: ${localeString(coinInfo.bollingerHigh)}` + "\n";
        message += `볼밴 M: ${localeString(coinInfo.maAvg)}` + "\n";
        message += `볼밴 L: ${localeString(coinInfo.bollingerLow)}` + "\n";
      }
      // else if (close >= bollingerHigh) {
      //   message = `볼린저밴드 high값 위로 올라감
      //   코인: ${market}
      //   현재가: ${close}
      //   볼린저밴드 HIGH: ${bollingerHigh}
      //   볼린저밴드 MIDDLE: ${maAvg}
      //   볼린저밴드 LOW: ${bollingerLow}`;
      // }
      return message;
    });

    return arrResultMessage.filter((item) => item !== "");
  } catch (err) {
    throw err;
  }
};
