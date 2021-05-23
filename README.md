## .env 파일 생성

```markdown
# UPBIT 자산조회,주문조회,출금조회,입금조회

UBIT_ACCESS_KEY=
UBIT_SECRET_KEY=

# TELEGRAM

TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=

# COIN alarm-bollingerband

UBIT_COIN=KRW-BTC
CANDLE_TYPE=240
DAYS=20
```

### 업비트 API

```memo
## EXCHANGE API

### 주문 요청

- 초당 8회, 분당 200회

### 주문 요청 외 API

- 초당 30회, 분당 900회

[Exchange API 추가 안내 사항]

- 본 기준은 개별 Open API Key에 대한 요청 수 제한 기준 입니다.
- 본 기준 내의 요청의 경우에도 하나의 계정으로 여러 개의 Open API Key를 이용하여 요청할 경우, 업비트 전체 서비스의 안정적인 제공을 위하여 요청 수 제한이 발생할 수 있습니다.
- 서비스 및 서버 상황 등에 따라 상기 요청 수가 일시적으로 보장되지 않을 수 있습니다.
- 사용 가능한 잔여 요청 수는 하단의 잔여 요청 수 확인 방법을 참고하시어 확인하실 수 있습니다.
- (업데이트) 주문 요청 API와 주문 요창 외 API 요청 수 제한은 별도로 계산 됩니다.

## QUOTATION API

1. Websocket 연결 요청 수 제한

- 초당 5회, 분당 100회

2. REST API 요청 수 제한

- 분당 600회, 초당 10회 (종목, 캔들, 체결, 티커, 호가별)

[Quotation API 추가 안내 사항]

- Quotation API의 요청 수 제한은 IP 주소를 기준으로 합니다.
- 향후 안정적인 서비스 제공을 위하여 API 요청 수는 추가적인 조정이 이루어질 수 있습니다. 요청 수 조정 필요 시 별도 공지를 통해 안내드리겠습니다.
- 초당 제한 조건과 분당 제한 조건 중 하나의 조건이라도 요청 수를 초과할 경우 요청 수 제한 적용 됩니다.
- 요청 수 제한 조건에 적용되는 시간 조건은 첫 요청 시간을 기준으로하며, 일정 시간 이후 초기화됩니다.(실패한 요청은 요청 횟수에 포함되지 않습니다.)
- 다수의 REST API 요청이 필요하신 경우, 웹소켓을 통한 수신 부탁드립니다.

pm2 delete auto-trade && pm2 start dist/index.js --name "auto-trade" -o /home/pi/log/auto-trade.log -e /home/pi/log/auto-trade.log --merge-logs

```
