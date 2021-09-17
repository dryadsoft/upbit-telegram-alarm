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
