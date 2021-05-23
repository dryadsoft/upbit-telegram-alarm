import axios, { AxiosResponse } from "axios";
import "dotenv/config";
import {
  IAccountProps,
  IApiKeyStatusProps,
  IOrderChanceProps,
} from "../@types/ubit";
import {
  getAuthorizationToken,
  getAuthorizationTokenNoParam,
} from "./authorizationToken";
import { ACCOUNT_URL, API_KEYS_URL, ORDER_CHANCE_URL } from "./const";

/******************************************************************************
 * 자산
 ******************************************************************************/

/**
 * 전체 계좌 조회
 * @return Promise<IGetAccountProps[]>
 */
export const getAllAccount = async (): Promise<IAccountProps[]> => {
  try {
    const authorizationToken = getAuthorizationTokenNoParam();
    const res = await axios({
      method: "GET",
      url: ACCOUNT_URL,
      headers: { Authorization: authorizationToken },
    });
    const { data }: AxiosResponse<IAccountProps[]> = res;
    return data;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/******************************************************************************
 * 주문
 ******************************************************************************/

/**
 * 주문 가능 정보
 */
export const getOrderChance = async (
  coin: string
): Promise<IOrderChanceProps> => {
  try {
    const { authorizationToken, query } = getAuthorizationToken({
      market: coin,
    });
    const res = await axios({
      method: "GET",
      url: `${ORDER_CHANCE_URL}?${query}`,
      headers: { Authorization: authorizationToken },
    });
    const { data }: AxiosResponse<IOrderChanceProps> = res;
    return data;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};

/**
 * 개별 주문 정보
 */

/**
 * 주문 리스트 조회
 */

/**
 *  주문 취소 접수
 */

/**
 * 주문하기
 */

/******************************************************************************
 * 출금
 ******************************************************************************/

/******************************************************************************
 * 입금
 ******************************************************************************/

/******************************************************************************
 * 서비스 정보
 ******************************************************************************/
/**
 * API 키 리스트 조회
 */
export const getApiKeyStatus = async () => {
  try {
    const authorizationToken = getAuthorizationTokenNoParam();
    const res = await axios({
      method: "GET",
      url: API_KEYS_URL,
      headers: { Authorization: authorizationToken },
    });
    const { data }: AxiosResponse<IApiKeyStatusProps[]> = res;
    return data;
  } catch (err) {
    const {
      response: { data },
    } = err;
    throw data;
  }
};
