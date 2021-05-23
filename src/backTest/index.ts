import { getDayCandles } from "../ubit";

// OHLCV(open, high, low, close, volume)로 당일 시가, 고가, 저가, 종가, 거래량에 대한 데이터
/**
 * OHLCV(open, high, low, close, volume)로 당일 시가, 고가, 저가, 종가, 거래량에 대한 데이터
 * @return Array [캔들 기준 시각(KST 기준), 시가, 고가, 저가, 종가, 거래량]
 */
const get_ohlcv = async (market: string, count: number, to?: string) => {
  try {
    const arrDayCandles = await getDayCandles({
      marketCoin: market,
      count: count,
      to,
      //   to: "2021-04-18 23:59:59",
    }); //
    const ohlcv = arrDayCandles.map((item) => {
      return {
        time: item.candle_date_time_kst,
        open: item.opening_price,
        high: item.high_price,
        low: item.low_price,
        close: item.trade_price,
        volume: item.candle_acc_trade_volume,
        range: 0,
        target: 0,
        ror: 0,
        hpr: 0,
        dd: 0,
      };
    });
    // ohlcv.sort(
    //   (a, b) =>
    //     Number(a.time.substring(0, 10).replace(/-/g, "")) -
    //     Number(b.time.substring(0, 10).replace(/-/g, ""))
    // );
    return ohlcv;
  } catch (err) {
    throw err;
  }
};

(async () => {
  const coinCode = "KRW-XRP";
  const days = 7;
  try {
    let df = await get_ohlcv(coinCode, days); // KRW-XRP, BTC-XRP

    // 변동폭 * k 계산, (고가 - 저가) * k값
    df = df.map((item) => {
      return { ...item, range: (item.high - item.low) * 0.5 };
    });

    // target(매수가), range 컬럼을 한칸씩 밑으로 내림(.shift(1))
    df = df.map((item, index) => {
      return { ...item, target: item.open + df[index - 1]?.range };
    });

    // ror(수익률), (조건문, 참일때 값, 거짓일때 값)
    df = df.map((item) => {
      return {
        ...item,
        ror: item.high > item.target ? item.close / item.target : 1,
      };
    });

    // 누적 수익률: 누적 곱 계산(cumprod)
    df = df.map((item, index) => {
      return {
        ...item,
        hpr: getCumprod(df, "ror", index),
      };
    });

    // 낙폭 Draw Down 계산 (누적 최대 값과 현재 hpr 차이 / 누적 최대값 * 100)
    df = df.map((item, index) => {
      return {
        ...item,
        dd:
          ((getCumMax(df, "hpr", index) - item.hpr) /
            getCumMax(df, "hpr", index)) *
          100,
      };
    });

    // 이동  평균값
    const maAvg = await getMa(coinCode, 15);
    console.log(maAvg);

    // #MDD 계산
    // print("MDD(%): ", df['dd'].max())
    console.log(df);
    //   df['target'] = df['open'] + df['range'].shift(1)
  } catch (err) {
    console.log(err);
  }
})();

/**
 * 누적곱
 */
function getCumprod(arrObj: any, column: string, index: number) {
  let result = 1;
  for (let i = 0; i <= index; i++) {
    result *= arrObj[i][column];
  }
  return result;
}

/**
 * 누적최대값
 */
function getCumMax(arrObj: any, column: string, index: number) {
  const newArrObj = arrObj.slice(0, index + 1);
  newArrObj.sort((a: any, b: any) => Number(b[column]) - Number(a[column]));
  //   console.log("new", newArrObj);
  return newArrObj[0][column];
}

/**
 * ma 이동평균값
 */
async function getMa(coinCode: string, maCount: number, toDdate?: string) {
  const df = await get_ohlcv(coinCode, maCount);
  const maSum = df.reduce((acc: any, cur) => {
    return acc + cur.close;
  }, 0);
  const maAvg = maSum / maCount;
  return maAvg;
}
