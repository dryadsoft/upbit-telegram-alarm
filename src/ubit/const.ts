/**
 * ubit server url
 */
const UBIT_SERVER_URL = `https://api.upbit.com/v1` as const;

/**
 * 전체 계좌 조회
 */
export const ACCOUNT_URL = `${UBIT_SERVER_URL}/accounts` as const;

/**
 * 주문 가능 정보
 */
export const ORDER_CHANCE_URL = `${UBIT_SERVER_URL}/orders/chance` as const;

/**
 * 마켓 코인정보
 */
export const MARKET_ALL_URL = `${UBIT_SERVER_URL}/market/all` as const;
/**
 * Ticker 조회
 */
export const TICKER_URL = `${UBIT_SERVER_URL}/ticker` as const;
/**
 * 분 Candle 조회
 */
export const CANDLES_MINUTES_URL = `${UBIT_SERVER_URL}/candles/minutes` as const;
/**
 * 일 Candle 조회
 */
export const CANDLES_DAY_URL = `${UBIT_SERVER_URL}/candles/days` as const;
/**
 * API 키 목록 조회
 */
export const API_KEYS_URL = `${UBIT_SERVER_URL}/api_keys` as const;

/**
 * 호가 정보 조회
 */
export const ORDER_BOOK_URL = `${UBIT_SERVER_URL}/orderbook` as const;
