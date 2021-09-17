export interface ICoinProps {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface ISelectedCoins {
  market: string;
  close: number;
  maAvg: number;
  bollingerHigh: number;
  bollingerLow: number;
  rsi: number;
}
