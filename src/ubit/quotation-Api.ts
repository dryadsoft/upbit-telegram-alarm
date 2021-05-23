import axios, { AxiosResponse } from "axios";
import {
  ICandleDayReturnProps,
  ICandleReturnProps,
  ICandlesDayProps,
  ICandlesMinutesProps,
  IMarketAllInfoProps,
  IMarketCoinProps,
  IOrderbookProps,
  ITickerProps,
} from "../@types/ubit";
import {
  CANDLES_DAY_URL,
  CANDLES_MINUTES_URL,
  MARKET_ALL_URL,
  ORDER_BOOK_URL,
  TICKER_URL,
} from "./const";

/******************************************************************************
 * 시세 종목 조회
 ******************************************************************************/
/**
 * 마켓 코드 조회 (access key 필요없음)
 */
export const getMarketAllInfo = async (): Promise<IMarketAllInfoProps> => {
  try {
    const res = await axios({
      method: "GET",
      url: MARKET_ALL_URL,
    });
    const { data }: AxiosResponse<IMarketCoinProps[]> = res;
    let returnObj: IMarketAllInfoProps = { KRW: [], BTC: [], USDT: [] };
    data.forEach((item) => {
      const marketPlace = item.market.split("-")[0];
      if (marketPlace === "KRW") {
        returnObj["KRW"].push(item);
      } else if (marketPlace === "BTC") {
        returnObj["BTC"].push(item);
      } else {
        returnObj["USDT"].push(item);
      }
    });
    return returnObj;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/******************************************************************************
 * 시세 캔들 조회
 ******************************************************************************/
/**
 * 분 캔들 조회 (access key 필요없음)
 */
export const getMinutesCandles = async ({
  minutes,
  marketCoin,
  count,
  to,
}: ICandlesMinutesProps) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${CANDLES_MINUTES_URL}/${minutes}?market=${marketCoin}&count=${count}${
        to ? `&to=${to}` : ""
      }`,
    });
    const { data }: AxiosResponse<ICandleReturnProps[]> = res;

    return data.reverse();
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/**
 * 일 캔들 조회 (access key 필요없음)
 */
export const getDayCandles = async ({
  marketCoin,
  count,
  to,
}: ICandlesDayProps) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${CANDLES_DAY_URL}/?market=${marketCoin}&count=${count}${
        to ? `&to=${to}` : ""
      }`,
    });
    const { data }: AxiosResponse<ICandleDayReturnProps[]> = res;

    return data.reverse();
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/**
 * 주 캔들 조회 (access key 필요없음)
 */

/**
 * 월 캔들 조회 (access key 필요없음)
 */

/******************************************************************************
 * 시세 Ticker 조회
 ******************************************************************************/
/**
 *  현재가 정보 조회 (access key 필요없음)
 * @desc 요청 당시 종목의 스냅샷을 반환한다.
 * @param marketCoinCode: string  => KRW-BTC  or   KRW-BTC,BTC-IOST
 * @return Promise<ITickerProps[]>
 */
export const getTicker = async (
  marketCoinCode: string[]
): Promise<ITickerProps[]> => {
  try {
    const res = await axios({
      method: "GET",
      url: `${TICKER_URL}?markets=${marketCoinCode.join(",")}`,
    });
    const { data }: AxiosResponse<ITickerProps[]> = res;
    return data;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/******************************************************************************
 * 시세 호가 정보(Orderbook) 조회
 ******************************************************************************/
/**
 *  호가 정보 조회 (access key 필요없음)
 * @param marketCoinCode: string  => KRW-BTC  or   KRW-BTC,BTC-IOST
 * @return Promise<IOrderbookProps[]>
 */
export const getOrderbook = async (marketCoinCode: string[]) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${ORDER_BOOK_URL}?markets=${marketCoinCode.join(",")}`,
    });
    const { data }: AxiosResponse<IOrderbookProps[]> = res;
    return data;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};
