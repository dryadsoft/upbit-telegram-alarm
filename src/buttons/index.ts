import { getDivByNum } from "../Utils";

// 텔레그램채팅창 하단에 키보드버튼생성
export const getStartKeyboard = (isAlarmOn: boolean) => {
  const alarmOnOfButton = isAlarmOn ? "/알람 끄기" : "/알람 켜기";
  return [
    [alarmOnOfButton, "/코인선택"],
    [`/볼밴`, `/캔들`],
  ];
};

// 캔들 선택버튼
export const candleInlineButton = [
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
];

// 볼린저밴드 선택버튼
export const bollingerInlineButton = [
  [
    { text: "-3 %", callback_data: "-3" },
    { text: "-2 %", callback_data: "-2" },
    { text: "-1 %", callback_data: "-1" },
    { text: "0 %", callback_data: "0" },
    { text: "1 %", callback_data: "1" },
    { text: "2 %", callback_data: "2" },
    { text: "3 %", callback_data: "3" },
  ],
];

export const coinsInlineButton = async (allCoins: any[], index?: number) => {
  index = index || 0;
  const end = (index === 0 && 15) || undefined;
  // console.log(this.allCoins);
  let inlineButtons = allCoins.map((item) => ({
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
  return [...inlineButtons2];
};
