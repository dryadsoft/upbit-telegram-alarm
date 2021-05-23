export interface IAccountProps {
  currency: string; // 화폐를 의미하는 영문 대문자 코드
  balance: string; // 주문가능 금액/수량
  locked: string; // 주문 중 묶여있는 금액/수량
  avg_buy_price: string; // 매수평균가
  avg_buy_price_modified: boolean; // 매수평균가 수정 여부
  unit_currency: string; // 평단가 기준 화폐
}

interface IBidAskProps {
  currency: string;
  price_unit: string | null;
  min_total: string;
}

interface IMarketProps {
  id: string;
  name: string;
  order_types: string[];
  order_sides: string[];
  bid: IBidAskProps;
  ask: IBidAskProps;
}
/**
 * 화폐의 계좌 상태
 */
export interface IOrderChanceProps {
  bid_fee: string;
  ask_fee: string;
  market: IMarketProps;
  bid_account: IAccountProps;
  ask_account: IAccountProps;
}

export interface IMarketCoinProps {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface IMarketAllInfoProps {
  KRW: IMarketCoinProps[];
  BTC: IMarketCoinProps[];
  USDT: IMarketCoinProps[];
}

export interface ITickerProps {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}
export type minutesType = "1" | "3" | "5" | "10" | "15" | "30" | "60" | "240";
export type TCandleType = minutesType | "day";
export interface ICandlesMinutesProps {
  minutes: minutesType;
  marketCoin: string;
  count: number;
  to?: string;
}

export interface ICandlesDayProps {
  marketCoin: string;
  count: number;
  to?: string;
  convertingPriceUnit?: string;
}

export interface ICandleReturnProps {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  unit: number;
}

export interface ICandleDayReturnProps {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  prev_closing_price: number;
  change_price: number;
  change_rate: number;
}

export interface IApiKeyStatusProps {
  access_key: string;
  expire_at: string;
}

/**
 * @ask_price 매도호가	Double
 * @bid_price 매수호가	Double
 * @ask_size 매도 잔량	Double
 * @bid_size 매수 잔량	Double
 */
export interface IOrderbook_unitsProps {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

/**
 * @market	마켓 코드	String
 * @timestamp	호가 생성 시각	Long
 * @total_ask_size	호가 매도 총 잔량	Double
 * @total_bid_size	호가 매수 총 잔량	Double
 * @orderbook_units	호가	List of Objects
 */
export interface IOrderbookProps {
  market: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: IOrderbook_unitsProps[];
}

export interface IOhlcvProps {
  market: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  accPrice: number;
  volume: number;
  range: number;
  target: number;
  ror: number;
  hpr: number;
  dd: number;
  maAvg?: number; // ma이평선값
  sqrt?: number; // 표준편차
  bollingerHigh?: number;
  bollingerLow?: number;
}

export interface ITargetCoinsProps {
  market: string;
  targetPrice: number;
  currentPrice: number;
  korean_name: string;
  accPrice: number;
  volume: number;
  maAvg: number;
  bestK: number;
  hpr: number;
  open: number;
  row: number;
}
