import axios from "axios";
import {
  IResultProps,
  IRsiHighRowProps,
  IUpbitParamProps,
} from "../@types/telegram-bot";
import { IMarketCoinProps, TCandleType } from "../@types/ubit";
import { getAllAccount, getMarketAllInfo } from "../ubit";
import { asyncLog, getDivByNum, getErrorMessage, sleep } from "../util";

export default class TelegramBot {
  private teletramToken: string;
  private chatId: string;
  private lastMessageUpdateId: number | null;
  private alarmOnOff: "on" | "off";
  private candleType: TCandleType;
  private arrCoin: string[];
  private arrTmpCoin: string[];
  private days: number;
  private lowPersentage: number;
  private allCoins: IMarketCoinProps[];
  private rsiHR: IRsiHighRowProps;
  private rsiTmpHR: IRsiHighRowProps;
  constructor(teletramToken: string, chatId: string) {
    this.teletramToken = teletramToken;
    this.chatId = chatId;
    this.lastMessageUpdateId = null;
    this.alarmOnOff = "off";
    this.candleType = "60";
    this.days = 20;
    this.lowPersentage = -2;
    this.arrCoin = [];
    this.arrTmpCoin = [];

    this.allCoins = [];
    this.rsiHR = {};
    this.rsiTmpHR = {};
  }

  async init({ candleType, days }: IUpbitParamProps) {
    this.lastMessageUpdateId = await this.getInitLastUpdateId();
    this.setUpbitParam({ candleType, days });
    let message = "알람봇이 실행되었습니다.\n";
    message += this.getAlarmStatusMessage();
    this.initSendMessage(message);
  }

  async watchChat() {
    while (true) {
      try {
        await this.getUpdates();
        await sleep(1000);
      } catch (err) {
        console.log("start=============================watchChat");
        console.log(err);
        console.log("end=============================watchChat");
      }
    }
  }

  getLastUpdateId() {
    return this.lastMessageUpdateId;
  }

  setLastUpdateId(updateId: number) {
    if (!this.lastMessageUpdateId || this.lastMessageUpdateId < updateId)
      this.lastMessageUpdateId = updateId;
  }

  getUpbitParam() {
    return {
      candleType: this.candleType,
      days: this.days,
      lowPersentage: this.lowPersentage,
      arrCoin: this.arrCoin,
      allCoins: this.allCoins,
      rsiHR: this.rsiHR,
    };
  }

  setUpbitParam({
    candleType,
    days,
    lowPersentage = this.lowPersentage,
    arrCoin = this.arrCoin,
  }: IUpbitParamProps) {
    this.candleType = candleType;
    this.days = days;
    this.lowPersentage = lowPersentage;
    this.arrCoin = arrCoin;
  }

  getAlarmStatusMessage() {
    const selectedCoins = this.arrCoin.reduce((acc: string[], cur) => {
      acc = [...acc, ...cur];
      return acc;
    }, []);
    // console.log(selectedCoins);
    let message = "";
    message += `알람상태: ${this.alarmOnOff === "on" ? `켜짐` : `꺼짐`}` + "\n";
    message +=
      `코인: ${this.getCoinKoreanName(selectedCoins).join(", ")}` + "\n";
    message += `캔들: ${this.candleType} 봉` + "\n";
    message += `볼밴: ${this.lowPersentage}%` + "\n";
    message +=
      `RSI: low - ${this.rsiHR.low || `미선택`}, high - ${
        this.rsiHR.high || `미선택`
      }` + "\n";
    return message;
  }

  /**
   * 최초 채팅방 마지막 메시지번호 가져오기
   */
  async getInitLastUpdateId() {
    try {
      const res: {
        data: { ok: boolean; result: IResultProps[] };
      } = await axios.get(
        `https://api.telegram.org/bot${this.teletramToken}/getUpdates`
      );
      const {
        data: { ok, result },
      } = res;
      if (ok) {
        // console.log(result);
        if (result.length > 0) {
          return result[result.length - 1].update_id;
        }
        return null;
      }
      return null;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
      throw err;
    }
  }

  /**
   * 채팅방 메시지 받아오기
   */
  async getUpdates() {
    try {
      // console.log(this.lastMessageUpdateId);
      let url = `https://api.telegram.org/bot${this.teletramToken}/getUpdates`;
      if (this.lastMessageUpdateId) {
        url = `https://api.telegram.org/bot${
          this.teletramToken
        }/getUpdates?offset=${this.lastMessageUpdateId + 1}`;
      }
      const res: {
        data: { ok: boolean; result: IResultProps[] };
      } = await axios.get(url);
      const {
        data: { ok, result },
      } = res;
      // console.log(result);
      if (ok) {
        result.forEach(async (item) => {
          // console.log(item);
          if (item.message) {
            // 일반 메시지
            const {
              message: {
                chat: { id },
                from: { is_bot },
                text,
              },
              update_id,
            } = item;

            // 내것만 처리
            if (String(id) === this.chatId) {
              this.setLastUpdateId(update_id);
              if (!is_bot) {
                // bot 메시지가 아닐때
                let message = "";
                switch (text) {
                  case "/start":
                    message = "업비트알람에 오신걸 환영합니다.";
                    await this.sendInlineKeboardMessage(message);
                    break;
                  case "/알람 켜기":
                    if (this.arrCoin.length === 0) {
                      message =
                        "선택된 코인이 존재하지 않습니다.\n먼저 코인을 선택하십시오.";
                      await this.sendInlineKeboardMessage(message);
                    } else {
                      this.alarmOnOff = "on";
                      message = "알람을 시작합니다.";
                      await this.sendInlineKeboardMessage(message);
                    }

                    break;
                  case "/알람 끄기":
                    this.alarmOnOff = "off";
                    message = "알람이 종료되었습니다.";
                    await this.sendInlineKeboardMessage(message);
                    break;
                  case "/코인선택":
                    // const coinsButton = await this.coinsButton();
                    const coinMenuTypeButton = this.coinMenuTypeButton();
                    this.sendinlineButtonMessage(
                      "보유코인 또는 코인직접선택을 눌러주세요.",
                      coinMenuTypeButton
                    );
                    break;
                  case "/1":
                  case "/3":
                  case "/5":
                  case "/10":
                  case "/15":
                  case "/30":
                  case "/60":
                  case "/240":
                  case "/일":
                    const bong: any = text.replace("/", "");
                    message = `${bong} 봉으로 변경되었습니다.`;
                    this.setUpbitParam({
                      candleType: bong,
                      days: this.days,
                    });
                    await this.sendInlineKeboardMessage(message);
                    break;
                  case "/캔들":
                    const candleButton = this.candleButton();
                    this.sendinlineButtonMessage(
                      "캔들을 선택하십시오.",
                      candleButton
                    );
                    break;
                  case "/볼밴":
                    const persentageButton = this.persentageButton();
                    this.sendinlineButtonMessage(
                      "볼린저밴드 기준을 선택하십시오.",
                      persentageButton
                    );
                    break;
                  case "/RSI":
                    this.rsiTmpHR = {}; // 초기화
                    const rsiButton = this.rsiButton();
                    this.sendinlineButtonMessage(
                      "RSI 기준을 선택하십시오.",
                      rsiButton
                    );
                    break;
                  default:
                    message =
                      "현재 알람봇상태입니다\n" + this.getAlarmStatusMessage();
                    await this.sendInlineKeboardMessage(message);
                    break;
                }
              }
            }
          } else if (item.callback_query) {
            // 화면내의 버튼 콜백
            // console.log(item);
            const {
              callback_query: {
                message: { message_id, text },
                data,
              },
              update_id,
            } = item;
            this.setLastUpdateId(update_id);

            let message2 = "";
            switch (text) {
              case "캔들을 선택하십시오.":
                const bong: any = data;
                this.setUpbitParam({
                  ...this.getUpbitParam(),
                  candleType: bong,
                });
                message2 = `${bong} 봉으로 변경되었습니다.`;
                await this.deleteMessage(message_id);
                await this.sendInlineKeboardMessage(message2);
                break;
              case "볼린저밴드 기준을 선택하십시오.":
                this.setUpbitParam({
                  ...this.getUpbitParam(),
                  lowPersentage: Number(data),
                });
                message2 = `${data} % 로 변경되었습니다.`;
                await this.deleteMessage(message_id);
                await this.sendInlineKeboardMessage(message2);
                break;
              case "보유코인 또는 코인직접선택을 눌러주세요.":
                // holdingCoins
                // coinSelection
                this.arrTmpCoin = [];
                await this.deleteMessage(message_id);
                if (data === "coinSelection") {
                  // 코인 직접 선택
                  // const coinsButton = await this.coinsButton();
                  const coinsButton = await this.coinsButton();
                  this.sendinlineButtonMessage(
                    "알람받을 코인을 선택하세요.",
                    coinsButton
                  );
                  const coinsButton2 = await this.coinsButton(15);
                  this.sendinlineButtonMessage(
                    "알람받을 코인을 선택하세요.",
                    coinsButton2
                  );
                } else if (data === "holdingCoins") {
                  // 보유코인
                  const myHoldingCoins = await this.getHoldingCoins();
                  this.setUpbitParam({
                    ...this.getUpbitParam(),
                    arrCoin: getDivByNum(myHoldingCoins, 10),
                  });
                  const coin_korean = this.getCoinKoreanName(myHoldingCoins);
                  let message =
                    `총 ${coin_korean.length}개의 보유코인이 선택되었습니다.` +
                    "\n";
                  message += coin_korean.join(", ");
                  await this.sendInlineKeboardMessage(message);
                }
                break;
              case "알람받을 코인을 선택하세요.":
                if (data === "confirm") {
                  await this.deleteMessage(message_id - 1);
                  await this.deleteMessage(message_id);
                  const arrCoin = [...new Set(this.arrTmpCoin)];

                  this.setUpbitParam({
                    ...this.getUpbitParam(),

                    arrCoin: getDivByNum(arrCoin, 10),
                  });

                  const coin_korean = this.getCoinKoreanName(arrCoin);
                  let message =
                    `총 ${coin_korean.length}개의 코인이 선택되었습니다.` +
                    "\n";
                  message += coin_korean.join(", ");
                  await this.sendInlineKeboardMessage(message);
                } else {
                  this.arrTmpCoin.push(data);
                }

                break;
              case "RSI 기준을 선택하십시오.":
                if (data === "confirm") {
                  this.rsiHR = this.rsiTmpHR;
                  if (Object.keys(this.rsiHR).length === 0) {
                    message2 = "RSI지표 알람이 꺼졌습니다.";
                  } else {
                    message2 = `RSI지표 알람기준이 선택되었습니다.\n(low: ${
                      this.rsiHR.low || `미선택`
                    }, high: ${this.rsiHR.high || "미선택"})`;
                  }
                  await this.deleteMessage(message_id);
                  await this.sendInlineKeboardMessage(message2);
                } else {
                  if (data < "50") {
                    this.rsiTmpHR.low = parseInt(data, 10);
                  } else {
                    this.rsiTmpHR.high = parseInt(data, 10);
                  }
                }
                break;
            }
          }
        });
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
    }
  }

  getCoinKoreanName(arrCoin: string[]) {
    // console.log(arrCoin);
    const coin_korean = arrCoin.map(
      (item) =>
        this.allCoins.filter((coin) => coin.market === item)[0].korean_name
    );
    return coin_korean;
  }

  /**
   * 메시지 보내기
   * @param message
   */
  async sendMessage(message: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.teletramToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: "markdown",
        }
      );
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
    }
  }

  getAlarmOnOff() {
    return this.alarmOnOff;
  }

  async initSendMessage(message: string) {
    await this.sendInlineKeboardMessage(message);
  }

  async sendInlineKeboardMessage(message: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.teletramToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: "MarkDown",
          reply_markup: this.getKeyboard(),
        }
      );
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
    }
  }

  async sendinlineButtonMessage(message: string, inlineButton: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.teletramToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: "MarkDown",
          reply_markup: inlineButton,
        }
      );
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
    }
  }

  async deleteMessage(messageId: number) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.teletramToken}/deleteMessage`,
        {
          chat_id: this.chatId,
          message_id: messageId,
        }
      );
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      await asyncLog(errorMsg);
    }
  }

  getKeyboard() {
    const alarmOnOfButton =
      this.getAlarmOnOff() === "on" ? "/알람 끄기" : "/알람 켜기";

    const keyboard = JSON.stringify({
      keyboard: [
        [alarmOnOfButton, "/코인선택"],
        [`/볼밴`, `/RSI`, `/캔들`],
      ],
      resize_keyboard: true,
    });
    return keyboard;
  }

  candleButton() {
    const inline_button = JSON.stringify({
      inline_keyboard: [
        [
          { text: "1분", callback_data: "1" },
          { text: "3분", callback_data: "3" },
          { text: "5분", callback_data: "5" },
        ],
        [
          { text: "10분", callback_data: "10" },
          { text: "15분", callback_data: "15" },
          { text: "30분", callback_data: "30" },
        ],
        [
          { text: "60분", callback_data: "60" },
          { text: "240분", callback_data: "240" },
          { text: "일", callback_data: "일" },
        ],
      ],
    });
    return inline_button;
  }

  persentageButton() {
    const inline_button = JSON.stringify({
      inline_keyboard: [
        [
          { text: "-3 %", callback_data: "-3" },
          { text: "-2 %", callback_data: "-2" },
          { text: "-1 %", callback_data: "-1" },
          { text: "0 %", callback_data: "0" },
          { text: "1 %", callback_data: "1" },
          { text: "2 %", callback_data: "2" },
          { text: "3 %", callback_data: "3" },
        ],
      ],
    });
    return inline_button;
  }

  coinMenuTypeButton() {
    const inline_button = JSON.stringify({
      inline_keyboard: [
        [
          { text: "보유코인", callback_data: "holdingCoins" },
          { text: "코인직접선택", callback_data: "coinSelection" },
        ],
      ],
    });
    return inline_button;
  }

  async coinsButton(index?: number) {
    index = index || 0;
    const end = (index === 0 && 15) || undefined;
    try {
      this.allCoins = (await getMarketAllInfo()).KRW;
      // console.log(this.allCoins);
      let inlineButtons = this.allCoins.map((item) => ({
        text: item.korean_name,
        callback_data: item.market,
      }));
      inlineButtons = getDivByNum(inlineButtons, 4);
      // inlineButtons
      let inlineButtons2: any = inlineButtons.slice(index, end);

      if (!end) {
        const tmp = [{ text: "확인", callback_data: "confirm" }];
        inlineButtons2[inlineButtons2.length] = tmp;
      }
      const inline_button = JSON.stringify({
        inline_keyboard: [...inlineButtons2],
      });
      return inline_button;
    } catch (err) {
      if (err.error.message) {
        await this.sendMessage(err.error.message);
      }
      await asyncLog(JSON.stringify(err));
      return "";
    }
  }
  rsiButton() {
    const inline_button = JSON.stringify({
      inline_keyboard: [
        [
          { text: "10", callback_data: "10" },
          { text: "20", callback_data: "20" },
          { text: "30", callback_data: "30" },
          { text: "40", callback_data: "40" },
        ],
        [
          { text: "60", callback_data: "60" },
          { text: "70", callback_data: "70" },
          { text: "80", callback_data: "80" },
          { text: "90", callback_data: "90" },
        ],
        [{ text: "확인", callback_data: "confirm" }],
      ],
    });
    return inline_button;
  }
  async getHoldingCoins() {
    try {
      this.allCoins = (await getMarketAllInfo()).KRW;
      const myAllAcount = await getAllAccount();
      const myHoldingCoins = myAllAcount.filter((item) => {
        for (const coin of this.allCoins) {
          // console.log(coin);
          // 원화 현금은 제외
          if (item.currency !== "KRW") {
            if (coin.market === `${item.unit_currency}-${item.currency}`) {
              return true;
            }
          }
        }
      });

      return myHoldingCoins.map(
        (item) => `${item.unit_currency}-${item.currency}`
      );
    } catch (err) {
      if (err.error.message) {
        await this.sendMessage(err.error.message);
      }
      await asyncLog(JSON.stringify(err));
      return [];
    }
  }
}
