import { ITargetCoinsProps } from "../@types/ubit";
import TelegramBot from "../telegram-bot";
import {
  getAllMarketBy10,
  getCurrentDate,
  getCurrentPrice,
  getDivByNum,
  getStartTime,
  getTargetCoins,
  sleep,
} from "../util";

const TELEGRAM_TOKEN = <string>process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = <string>process.env.TELEGRAM_CHAT_ID;
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID);

const days = 5;
const type = "240"; // "day"
let targetCoinsBy10: ITargetCoinsProps[] = [];
let isBuy = false; // 매수여부
let buyCoins: any = null;

export const autoTrade = async () => {
  while (true) {
    try {
      // 현재시간 조회
      const currentDate: any = getCurrentDate();
      // 코인 시작, 종료시간
      const { startTime, endTime } = await getStartTime(type, "KRW-BTC", 1);
      // console.log(startTime, currentDate, endTime);
      if (startTime < currentDate && currentDate < endTime) {
        // console.log("자동매수시간");
        await sleep(1000);
        if (!isBuy) {
          if (targetCoinsBy10.length === 0) {
            // 1. 10개단위로 코인정보 가져오기
            const allMarket = await getAllMarketBy10();
            // 2. 목표코인 가져오기
            const targetCoins = await getTargetCoins(allMarket, type, days);
            const arrCoinName = targetCoins.map((item) => item.korean_name);
            const message = `## 목표코인이 ${
              targetCoins.length
            }개 선택되었습니다.
                ## ${arrCoinName.join(",")}
                `;
            await telegramBot.sendMessage(message);
            // 3. 목표코인 10개로 구분하기(업비트 API 제한)
            targetCoinsBy10 = getDivByNum(targetCoins, 10);
          }
          // 4. 목표코인들을 조회하면서 현재가가 목표가에 도달하는 코인 가져오기
          const watchTargetCoins = await getTargetCoins(
            targetCoinsBy10,
            type,
            days
          );
          // 5. 현재가가 목표가 이상인것 필터링
          const resultWatch = watchTargetCoins.filter(
            (item) => item.currentPrice >= item.targetPrice
          );
          // console.log(resultWatch);

          if (resultWatch.length > 0) {
            isBuy = true; // 매수여부
            buyCoins = resultWatch[0]; // 매수코인 정보
            // console.log("매수가 도달");
            const message = `# 매수가 도달
                ## 코인명: ${buyCoins.korean_name}
                ## 시작가: ${buyCoins.open}
                ## 매수가: ${buyCoins.targetPrice}
                ## 예상매도가: ${buyCoins.targetPrice * 1.05}`;
            await telegramBot.sendMessage(message);
          }
        } else {
          // 이미 매수가 이루어진 상황이면
          if (buyCoins !== null) {
            const currentPrice = (await getCurrentPrice(buyCoins.market)) || 0;
            if (currentPrice >= buyCoins.targetPrice * 1.05) {
              const message = `# 매도가 도달
                  ## 코인명: ${buyCoins.korean_name}
                  ## 시작가: ${buyCoins.open}
                  ## 매수가: ${buyCoins.targetPrice}
                  ## 매도가: ${buyCoins.targetPrice * 1.05}`;
              await telegramBot.sendMessage(message);
              // 매수코인 초기화
              targetCoinsBy10 = [];
              buyCoins = null;
              isBuy = false; // 매수여부
            }
          }
        }

        // // 목표가 조회
        // const targetPrice = (await getTargetPrice("day", UBIT_COIN, 2, 0.5)) || 0;
        // // 현재가 조회
        // const currentPrice = (await getCurrentPrice(UBIT_COIN)) || 0;
        // console.log(targetPrice, currentPrice);
        // if (targetPrice < currentPrice) {
        //   console.log("매수가도달");
        //   console.log(`목표가: ${targetPrice}`);
        //   // 잔고조회 원화
        //   const balanceKrw = (await getBalance(KRW)) || 0;
        //   // console.log(balanceKrw);
        //   if (balanceKrw > 5000) {
        //     console.log("잔고 5000원 이상됨 매수 시도");
        //     // 지정가 매수
        //   }
        // } else {
        //   console.log("매수가 도달안됨");
        // }
      } else {
        if (buyCoins !== null) {
          const currentPrice = (await getCurrentPrice(buyCoins.market)) || 0;
          const message = `# 전량매도: ${type} 봉  시간 도달 10초전
                  ## 코인명: ${buyCoins.korean_name}
                  ## 매수가: ${buyCoins.targetPrice}
                  ## 매도가: ${currentPrice}`;
          await telegramBot.sendMessage(message);

          // // 잔고조회(코인)
          // const balanceBtc = await getBalance(buyCoins.market);
          // // console.log(balanceBtc);
          // 매수코인 초기화
          targetCoinsBy10 = [];
          buyCoins = null;
          isBuy = false; // 매수여부
        } else {
          // const message =
          //   "매수 코인이 존재하지 않습니다. 다음 봉으로 넘어갑니다.";
          // await telegramBot.sendMessage(message);
          // console.log(message);
          // 매수코인 초기화
          targetCoinsBy10 = [];
          buyCoins = null;
          isBuy = false; // 매수여부
        }

        // 지정가 매도
      }
      await sleep(1000);
    } catch (err) {
      // console.log(err);
      await telegramBot.sendMessage(`오류발생: ${err}`);
      await sleep(1000);
    }
  }
};
