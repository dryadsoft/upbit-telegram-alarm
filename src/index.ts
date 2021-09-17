import "dotenv/config";
import TelegramApi from "node-telegram-api";
import { QuoationService, UtilsService } from "node-upbit";
import { ICoinProps, ISelectedCoins } from "./@types";
import {
  bollingerInlineButton,
  candleInlineButton,
  coinsInlineButton,
  getStartKeyboard,
} from "./buttons";
import { calcOfYield, getDivByNum, localeString } from "./Utils";

const TELEGRAM_TOKEN = String(process.env.TELEGRAM_TOKEN);
const quoationService = new QuoationService();
const utilsService = new UtilsService();

// 1. telegram bot 객체 생성
const telegramApi = new TelegramApi(TELEGRAM_TOKEN, {
  polling: true, // polling 여부
  process: "series", // parallel: 병렬 메시지 처리, series: 직렬 메시지 처리
});

// 1. 채팅창 메시지 입력 후 콜백처리
// telegramApi.on("init", asyc() => {});
telegramApi.init((options) => {
  options.chatId = "";
  options.isAlarmOn = false;
  options.candleType = "";
  options.allCoins = [];
  options.selectedCoins = [];
  options.selectedBollinger = "";
});

// 2. 채팅창에 메시지가 입력되면 실행되는 콜백 Listener를 정의한다.
telegramApi.on("text", async ({ chatId, messageId, text, options }) => {
  let sendMsg = "";
  switch (text) {
    case "/start":
      sendMsg = "업비트 텔레그램 봇에 오신걸 환영합니다.";
      options && (options.chatId = chatId);
      await telegramApi.sendKeyboardMessage(
        chatId,
        sendMsg,
        getStartKeyboard(options?.isAlarmOn)
      );
      break;
    case "/알람 켜기":
      const selectedCoins = options && options.selectedCoins;
      const candleType = options && options.candleType;
      const selectedBollinger = options && options.selectedBollinger;
      if (selectedCoins.length === 0) {
        sendMsg = "선택된 코인이 존재하지 않습니다.\n먼저 코인을 선택하십시오.";
        await telegramApi.sendMessage(chatId, sendMsg);
      } else if (candleType === "") {
        sendMsg = "선택된 캔들이 존재하지 않습니다.\n먼저 캔들을 선택하십시오.";
        await telegramApi.sendMessage(chatId, sendMsg);
      } else if (selectedBollinger === "") {
        sendMsg =
          "선택된 볼린저밴드가 존재하지 않습니다.\n먼저 볼린저밴드를 선택하십시오.";
        await telegramApi.sendMessage(chatId, sendMsg);
      } else {
        sendMsg = "알람이 켜졌습니다";
        options && (options.chatId = chatId);
        options && (options.isAlarmOn = true);
        await telegramApi.sendKeyboardMessage(
          chatId,
          sendMsg,
          getStartKeyboard(options?.isAlarmOn)
        );
      }
      break;
    case "/알람 끄기":
      sendMsg = "알람이 꺼졌습니다";
      options && (options.isAlarmOn = false);
      await telegramApi.sendKeyboardMessage(
        chatId,
        sendMsg,
        getStartKeyboard(options?.isAlarmOn)
      );
      break;
    case "/코인선택":
      // console.log(arrCoins);
      if (options) {
        options.selectedCoins = [];
        options.allCoins = (await quoationService.getMarketAllInfo()).KRW;
        const ilnileButton = await coinsInlineButton(options.allCoins);
        sendMsg = "알람받을 코인을 선택하세요.";
        await telegramApi.sendInlineButtonMessage(
          chatId,
          sendMsg,
          ilnileButton
        );
        const ilnileButton2 = await coinsInlineButton(options.allCoins, 15);
        sendMsg = "알람받을 코인을 선택하세요.";
        await telegramApi.sendInlineButtonMessage(
          chatId,
          sendMsg,
          ilnileButton2
        );
      }
      break;
    case "/캔들":
      sendMsg = "캔들을 선택하십시오.";
      await telegramApi.sendInlineButtonMessage(
        chatId,
        sendMsg,
        candleInlineButton
      );
      break;
    case "/볼밴":
      sendMsg = "볼린저밴드 기준을 선택하십시오.";
      await telegramApi.sendInlineButtonMessage(
        chatId,
        sendMsg,
        bollingerInlineButton
      );
      break;
    default:
      if (options) {
        sendMsg = `알람: ${options.isAlarmOn ? "켜짐" : "꺼짐"}` + "\n";
        sendMsg += `캔들: ${options.candleType} 봉` + "\n";
        sendMsg +=
          `코인: ${options.selectedCoins
            .map((item: any) => item.korean_name)
            .join(", ")}` + "\n";
        sendMsg += `볼린저밴드: ${options.selectedBollinger}`;
        // await telegramApi.sendMessage(chatId, sendMsg);
        await telegramApi.sendKeyboardMessage(
          chatId,
          sendMsg,
          getStartKeyboard(options?.isAlarmOn)
        );
      }
      return;
  }
});

// 3. 채팅장에 생성된 버튼 클릭시 실행되는 콜백 Listener를 정의한다.
telegramApi.on(
  "callback",
  async ({ chatId, messageId, text, data, options }) => {
    let sendMsg = "";
    // text값은 inline버튼의 message 값이다.
    switch (text) {
      case "알람받을 코인을 선택하세요.":
        if (data === "confirm") {
          if (options && options.selectedCoins.length > 0) {
            // data값은 인라인버튼의 callback_data 값이다.
            options.selectedCoins = options.selectedCoins.map(
              (selCoin: string) =>
                options.allCoins.filter(
                  (coin: ICoinProps) => coin.market === selCoin
                )[0]
            );
            // console.log(options.selectedCoins);
            sendMsg += `코인이 선택되었습니다.` + "\n";
            sendMsg += `---------------------` + "\n";
            sendMsg += `${options.selectedCoins
              .map((item: any) => item.korean_name)
              .join(", ")}`;
            // 인라인버튼이 클릭되고 중복클릭을 방지하고싶다면 인라인버튼을 채팅창에서 삭제한다.
            await telegramApi.deleteMessage(chatId, messageId - 1);
            await telegramApi.deleteMessage(chatId, messageId);
            await telegramApi.sendMessage(chatId, sendMsg);
          } else {
            sendMsg = `선택된 코인이 없습니다. 다시 선택해주세요.`;
            await telegramApi.sendMessage(chatId, sendMsg);
          }
        } else {
          options && options.selectedCoins.push(data);
        }
        break;
      case "캔들을 선택하십시오.":
        options && (options.candleType = data);
        sendMsg = `캔들이 ${data} 봉으로 변경되었습니다.`;
        await telegramApi.deleteMessage(chatId, messageId);
        await telegramApi.sendMessage(chatId, sendMsg);
        break;
      case "볼린저밴드 기준을 선택하십시오.":
        options && (options.selectedBollinger = data);
        sendMsg = `볼린저밴드 알람기준이 ${data} % 로 변경되었습니다.`;
        await telegramApi.deleteMessage(chatId, messageId);
        await telegramApi.sendMessage(chatId, sendMsg);
        break;
      default:
        return;
    }
  }
);

const maCount = 20; // 기준봉

telegramApi.watch(async ({ options }) => {
  const isAlarmOn = options && options.isAlarmOn;
  if (isAlarmOn) {
    const chatId = options && options.chatId;
    const selectedCoins = options && options.selectedCoins;
    const candleType = options && options.candleType;
    const selectedBollinger = options && options.selectedBollinger;

    if (candleType !== "" && selectedCoins?.length > 0) {
      const arrCoin = getDivByNum<ICoinProps[]>(selectedCoins, 10); // 코인  10개단위로 구분(업비트 api제한)
      let totalCoins: ISelectedCoins[] = [];
      try {
        for (let i = 0; i < arrCoin.length; i++) {
          const getPromiseValue = arrCoin[i].map(
            async (objCoin: ICoinProps) => {
              if (i > 0) {
                console.log(i);
                await telegramApi.sleep(1000);
              }

              let result = await utilsService.getCmbr(
                candleType,
                objCoin.market,
                maCount
              );
              return result;
            }
          );
          const result = await Promise.all(getPromiseValue);
          totalCoins = [...totalCoins, ...result];
        }

        for (const coin of totalCoins) {
          if (
            coin.close <=
            calcOfYield(coin.bollingerLow, Number(selectedBollinger))
          ) {
            // 볼밴low 밑으로 내려갔을때
            let message = "";
            const koreanName = selectedCoins.filter(
              (item: any) => item.market === coin.market
            )[0].korean_name;
            message += "볼린저밴드가 low값 밑으로 내려갔습니다." + "\n";
            message += "-----------------------------" + "\n";
            message += `코인: ${koreanName}` + "\n";
            message += `현재가: ${localeString(coin.close)} 원` + "\n";
            message += `볼밴 H: ${localeString(coin.bollingerHigh)}` + "\n";
            message += `볼밴 M: ${localeString(coin.maAvg)}` + "\n";
            message += `볼밴 L: ${localeString(coin.bollingerLow)}` + "\n";
            message += `RSI지표: ${localeString(coin.rsi)}` + "\n";
            telegramApi.pushMessageQueue({ chatId, message }); // 메시지 push
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}, 2000);
