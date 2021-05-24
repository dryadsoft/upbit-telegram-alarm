import moment from "moment";
import "moment-timezone";
import {
  IMarketCoinProps,
  IOhlcvProps,
  ITargetCoinsProps,
  TCandleType,
} from "../@types/ubit";
import {
  getAllAccount,
  getDayCandles,
  getMarketAllInfo,
  getMinutesCandles,
  getOrderbook,
  getTicker,
} from "../ubit";

/**
 * OHLCV(open, high, low, close, volume)로 당일 시가, 고가, 저가, 종가, 거래량에 대한 데이터
 * @return Array [캔들 기준 시각(KST 기준), 시가, 고가, 저가, 종가, 거래량]
 * //   to: "2021-04-18 23:59:59"
 */
export const get_ohlcv = async (
  type: TCandleType,
  market: string,
  count: number,
  to?: string
): Promise<IOhlcvProps[]> => {
  try {
    let arrayCandleData;
    switch (type) {
      case "day":
        arrayCandleData = await getDayCandles({
          marketCoin: market,
          count: count,
          to,
          //   to: "2021-04-18 23:59:59",
        }); //
        break;
      case "1":
      case "3":
      case "5":
      case "10":
      case "15":
      case "30":
      case "60":
      case "240":
        arrayCandleData = await getMinutesCandles({
          minutes: type,
          marketCoin: market,
          count: count,
          to,
        });
        break;
    }

    const ohlcv = arrayCandleData.map((item: any) => {
      return {
        market: item.market,
        time: item.candle_date_time_kst,
        open: item.opening_price,
        high: item.high_price,
        low: item.low_price,
        close: item.trade_price,
        accPrice: item.candle_acc_trade_price,
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

/**
 * 전 봉 이동평균값을 구하기위하여 +1을 하여 캔들을 조회
 * @return Array [캔들 기준 시각(KST 기준), 시가, 고가, 저가, 종가, 거래량]
 * //   to: "2021-04-18 23:59:59"
 */
export const get_ohlcvPlusOne = async (
  type: TCandleType,
  market: string,
  count: number,
  to?: string
) => {
  count = count + 1;
  try {
    const ohlcv = await get_ohlcv(type, market, count, to);
    return ohlcv;
  } catch (err) {
    throw err;
  }
};

/**
 * 코인정보 10개 단위로 가져오기
 */
export const getAllMarketBy10 = async () => {
  try {
    const allMarket = await getMarketAllInfo();
    let allMarketby10 = getDivByNum(allMarket["KRW"], 10);

    return allMarketby10;
  } catch (err) {
    throw err;
  }
};

export const getDivByNum = <T>(arrObj: T[], num: number): T[] => {
  let resultObj: any = [];
  let tmp: T[] = [];
  arrObj.forEach((item, index) => {
    const idx = Math.floor(index / num);
    if (index % num === 0) {
      tmp = [];
    }
    tmp.push(item);
    resultObj[idx] = tmp;
  });
  return resultObj;
};
/**
 * ma 이동평균값
 */
export async function getMa(df: IOhlcvProps[], maCount: number) {
  df = df.map((item, index) => {
    let maAvg = 0;
    if (index !== 0 && index % (maCount - 1) === 0) {
      // console.log(index, maCount - 1);
      for (let i = index - (maCount - 1); i <= index; i++) {
        maAvg += df[i].close || 0;
      }
      maAvg = maAvg / maCount;
    }
    return { ...item, maAvg };
  });
  return df;
}

/**
 * ma 이동평균값 (전봉)
 */
export async function getYesterDayMa(df: IOhlcvProps[], maCount: number) {
  for (let i = df.length - 1; i >= 0; i--) {
    if (i >= maCount - 1) {
      let maSum = 0;
      for (let j = i; j >= i - (maCount - 1); j--) {
        maSum += df[j].close || 0;
      }
      df[i].maAvg = maSum / maCount;
    }
  }
  return df;
}

/**
 * ma 이동평균값을 이용하여 볼린저밴드값을 구한다.
 * 선행작업으로 이동평균값이 먼저 구해져있어야한다.
 */
export async function getBollingerBand(df: IOhlcvProps[], maCount: number) {
  for (let i = df.length - 1; i >= 0; i--) {
    if (i >= maCount - 1) {
      let deviation: number[] = []; // 편차(종가 - 이평선 평균값)
      const maAvg = df[i].maAvg || 0;
      for (let j = i; j >= i - (maCount - 1); j--) {
        deviation.push(df[j].close - maAvg);
      }
      const sumDeviation = deviation.reduce((acc, cur) => {
        acc += cur * cur;
        return acc;
      }, 0);
      const sqrt = Math.sqrt(sumDeviation / maCount);
      df[i].sqrt = sqrt;
      df[i].bollingerHigh = maAvg + sqrt * 2;
      df[i].bollingerLow = maAvg - sqrt * 2;
    }
  }
  return df;
}

/**
 * 목표가
 */
export const getTargetPrice = async (df: IOhlcvProps[]) => {
  const lastIndex = df.length - 1;
  const preIndex = lastIndex - 1;
  try {
    // const targetPrice =
    //   df[lastIndex].open + (df[preIndex].high - df[preIndex].low) * 0.5;

    const { k, hpr } = await getBestK(df); // best k값 구하기
    const targetPrice =
      df[lastIndex].open + (df[preIndex].high - df[preIndex].low) * 0.5;
    return {
      targetPrice,
      currentPrice: df[lastIndex].close,
      open: df[lastIndex].open,
      high: df[lastIndex].high,
      low: df[lastIndex].low,
      accPrice: df[lastIndex].accPrice,
      volume: df[lastIndex].volume,
      bestK: k,
      hpr,
    };
  } catch (err) {
    throw err;
  }
};

/**
 * best k 값 구하기
 * node 12.20.1 버전에서  df[index - 1]?.range 오류발생하여
 * df[index - 1].range || 0 수정함
 */
export const getBestK = async (df: IOhlcvProps[]) => {
  try {
    const arrK = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const test = arrK.map(async (k) => {
      df = df.map((item) => {
        return { ...item, range: (item.high - item.low) * k };
      });

      // target(매수가), range 컬럼을 한칸씩 밑으로 내림(.shift(1))
      df = df.map((item, index) => {
        return { ...item, target: item.open + df[index - 1].range || 0 };
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

      return { k, hpr: df[df.length - 2].hpr };
    });
    const result = await Promise.all(test);
    result.sort((a, b) => b.hpr - a.hpr);
    return result[0];
  } catch (err) {
    throw err;
  }
};

export const getTargetCoins = async (
  allMarket: any,
  type: TCandleType,
  days: number
) => {
  let targetCoins: ITargetCoinsProps[] = [];
  for (let i = 0; i < allMarket.length; i++) {
    const getTargetCoin: ITargetCoinsProps[] = allMarket[i].map(
      async (item: IMarketCoinProps) => {
        let df = await get_ohlcvPlusOne(type, item.market, days);
        // df = await getMa(df, days); // 이동평균값
        df = await getYesterDayMa(df, days); // 이동평균값
        const {
          targetPrice,
          currentPrice,
          open,
          high,
          low,
          accPrice,
          volume,
          bestK,
          hpr,
        } = await getTargetPrice(df);
        // const { maAvg } = await getMa(df, days);
        const maAvg = df[df.length - 2].maAvg || 0; // 이전 봉 이동평균값 (-2)
        if (
          currentPrice > maAvg &&
          currentPrice <= targetPrice &&
          hpr >= 1 &&
          targetPrice * 1.05 > currentPrice &&
          targetPrice * 1.05 > high
        ) {
          // 1. 현재가가 이동평균값보다 클때
          // 2. 현재가가 목표가보다 작거나 같은것만
          // 3. 누적수익률(hrp)이 1보다 클때만(수익이 있는것만)
          // 4. 목표가 + 5% 가 현재가보다 큰것만(현재가 대비 수익률 5% 이상 안된것만)
          // 5. 목표가 + 5% 가 고가 보다 큰것만 (고가 대비 수익률 5% 이상 안된것만)
          return {
            market: item.market,
            targetPrice,
            currentPrice,
            korean_name: item.korean_name,
            accPrice,
            volume,
            maAvg: maAvg,
            bestK,
            hpr,
            open,
            low,
          };
        }
      }
    );
    const result = await Promise.all(getTargetCoin);
    // console.log(result.filter((item) => item !== undefined));
    targetCoins = [
      ...targetCoins,
      ...result.filter((item) => item !== undefined),
    ];
    await sleep(1000);
  }
  targetCoins.sort((a, b) => b.accPrice - a.accPrice);
  return targetCoins;
};

/**
 * 현재가 정보
 * @desc 요청 당시 종목의 스냅샷을 반환한다.
 * */
export const getCurrentPrice = async (coin: string) => {
  try {
    const arrTickerCurrentPrice = await getTicker([coin]); // ticker 조회
    const filtered = arrTickerCurrentPrice.filter(
      (item) => item.market === coin
    );

    return filtered[0].trade_price;
  } catch (err) {
    console.log(err);
  }
};
/**
 * 누적곱
 * @desc 전일 이동편균값을 구하기위해 arrObj값이 +1되었기때문에
 * 누적곱을 구할때 첫번째 row는 제외한다.
 */
function getCumprod(arrObj: any, column: string, index: number) {
  let result = 1;
  for (let i = 1; i <= index; i++) {
    result *= arrObj[i][column];
  }
  return result;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const getStartTime = async (
  type: TCandleType,
  coin: string,
  days: number
) => {
  const df = await get_ohlcv(type, coin, days);

  const startTime: any = moment(df[0].time).format("YYYYMMDDHHmmss");

  const hours = type === "240" ? 4 : 24;
  const endTime: any = moment(df[0].time)
    .add(hours, "hours")
    .add(-10, "seconds")
    .format("YYYYMMDDHHmmss");

  return { startTime, endTime };
};

// 현재시간 조회
export const getCurrentDate = (pFormat?: string) => {
  pFormat = pFormat || "YYYYMMDDHHmmss";
  return moment().tz("Asia/Seoul").format(pFormat);
};

/**
 * 호가 정보 조회
 * @desc 15호가 정보
 */
const getOrder = async (arrCoin: string[]) => {
  try {
    const test = await getOrderbook(arrCoin);
    return test[0];
  } catch (err) {
    console.log(err);
  }
};

/**
 * 목표가
 */
// const getTargetPrice = async (
//   type: TCandleType,
//   coin: string,
//   days: number,
//   k: number
// ) => {
//   try {
//     const df = await get_ohlcv(type, coin, days);
//     const target_price = df[1].open + (df[0].high - df[0].low) * k;
//     return target_price;
//   } catch (err) {
//     console.log(err);
//   }
// };

/**
 * 잔고 조회
 */
const getBalance = async (currency: string) => {
  try {
    const arrAllBalance = await getAllAccount();
    const getOneBalance = arrAllBalance.filter(
      (item) => item.currency === currency
    );
    return getOneBalance[0].balance;
  } catch (err) {
    console.log(err);
  }
};

/**
 * digits 소숫점이하 반올림하기
 * @param num
 * @param digits
 * @return number
 */
export const getFixed = (num: number, digits: number) => {
  if (!Number.isInteger(num)) {
    return parseFloat(num.toFixed(digits));
  }
  return num;
};

/**
 * 수익률에 따른 값 구하기
 */
export const calcOfYield = (amt: number, percentage = 0) => {
  let per = 0;
  per = 1 + percentage / 100;
  return amt * per;
};
/**
 * 숫자 3자리마다 콤마 직기
 */
export const localeString = (amt: number) => {
  const strAmt = amt.toFixed(2);
  return parseFloat(strAmt).toLocaleString("ko-KR");
};

/**
 * 로그 메시지
 */
export const asyncLog = (msg: any) => {
  return new Promise((resolve) => {
    console.log(`${getCurrentDate("YYYY-MM-DD HH:mm:ss")} ${msg}`);
    return resolve("");
  });
};

export const getErrorMessage = (err: any) => {
  let url,
    data,
    error_code,
    description = "";

  if (err.response) {
    url = err.response.config.url;
    data = err.response.config.data;
    error_code = err.response.data.error_code;
    description = err.response.data.description;
  } else if (err.request) {
    error_code = err.request;
  }

  if (url === "" && data === "" && error_code === "" && description === "") {
    return JSON.stringify(err);
  }
  const errMessage = `error ${error_code}: ${description}
  ${url}
  ${data}`;
  return errMessage;
};
