import { TCandleType } from "./ubit";

export interface IFromProps {
  id: number;
  is_bot: boolean;
  first_name: string;
  language_code: string;
}
export interface IChatProps {
  id: number;
  first_name: string;
  type: string;
}
export interface IEntitiesProps {
  offset: number;
  length: number;
  type: string;
}
export interface IMessage {
  message_id: number;
  from: IFromProps;
  chat: IChatProps;
  date: number;
  text: string;
  entities?: IEntitiesProps[];
}

export interface ICallbackProps {
  id: string;
  from: any;
  message: any;
  chat_instance: string;
  data: string;
}

export interface IResultProps {
  update_id: number;
  message?: IMessage;
  callback_query?: ICallbackProps;
}

export interface IRows {
  chat_id: number;
  date: number;
  first_name: string;
  update_id: number;
  key?: string;
  alarm_yn?: "Y" | "N";
  r_alarm_yn?: "Y" | "N";
  values_alarm_yn?: "Y" | "N";
  wus_alarm_yn?: "Y" | "N";
}

export interface INumRows {
  num: number;
  valuesNum: number;
  key: string;
}

export interface ILastTeleNum {
  update_id: number;
  key: string;
}

export interface IUpbitParamProps {
  candleType: TCandleType;
  days: number;
  lowPersentage?: number;
  arrCoin?: string[];
  holdingCoinsYn?: "Y" | "N";
}
