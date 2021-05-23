import crypto from "crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import querystring from "querystring";
import { v4 as uuidv4 } from "uuid";

const UBIT_ACCESS_KEY = String(process.env.UBIT_ACCESS_KEY);
const UBIT_SECRET_KEY = String(process.env.UBIT_SECRET_KEY);

/**
 * 파라미터가 없는경우
 */
export const getAuthorizationTokenNoParam = () => {
  const payload = {
    access_key: UBIT_ACCESS_KEY,
    nonce: uuidv4(),
  };

  const jwtToken = jwt.sign(payload, UBIT_SECRET_KEY);
  return `Bearer ${jwtToken}`;
};

/**
 * 파라미터가 존재하는 경우
 */
export const getAuthorizationToken = (params: {}) => {
  const query = querystring.encode(params); // 요청할 파라미터 세팅
  const hash = crypto.createHash("sha512");
  const queryHash = hash.update(query, "utf-8").digest("hex");

  const payload = {
    access_key: UBIT_ACCESS_KEY,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: "SHA512",
  };

  const jwtToken = jwt.sign(payload, UBIT_SECRET_KEY);
  return { authorizationToken: `Bearer ${jwtToken}`, query };
};
