import { TCandleType } from "../@types/ubit";

export default class DotEnvVariable {
  private coin: string;
  private candleType: TCandleType;
  private days: number;

  constructor(coin: string, candleType: TCandleType, days: number) {
    this.coin = coin;
    this.candleType = candleType;
    this.days = days;
  }
  _setParam(coin: string, candleType: TCandleType, days: number) {
    this.coin = coin;
    this.candleType = candleType;
    this.days = days;
  }
  _getParam() {
    return {
      coin: this.coin,
      candleType: this.candleType,
      days: this.days,
    };
  }
}
