# upbit-telegram-alarm

## 프로젝트 root 디렉토리에 .env 파일 생성

```markdown
# UPBIT 자산조회,주문조회,출금조회,입금조회

UBIT_ACCESS_KEY=
UBIT_SECRET_KEY=

# TELEGRAM

TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
```

## 프로젝트 dependencies 패키지 설치

```shell
$ yarn install

```

## pm2 패키지 설치

```shell
$ yarn global add pm2
```

## 실행

- 프로젝트 root 경로에서 실행한다.

```shell
$ pm2 start dist/index.js --name "upbit-telegram-alarm"
```

- 실행시 로그생성

```shell
$ pm2 start dist/index.js --name "upbit-telegram-alarm" -o /home/pi/log/auto-trade.log -e /home/pi/log/auto-trade.log --merge-logs
```
