# upbit-telegram-alarm

## 설치 (install):

```bash
$ git clone https://github.com/dryadsoft/upbit-telegram-alarm.git
```

프로젝트경로로 이동:

```bash
$ cd upbit-telegram-alarm
```

프로젝트 dependencies 패키지 설치:

```bash
$ yarn install
# 또는
$ npm install
```

환경설정파일생성:

```bash
# 프로젝트 root 경로에 .env 파일 생성
$ touch .env
```

.env 파일에 텔레그램토큰 입력

```
TELEGRAM_TOKEN=텔레그램토큰입력
```

pm2 패키지 설치:

> pm2 패키지가 이미 설치되어있다면 다시 설치할 필요없다.

```bash
$ yarn global add pm2
# 또는
$ npm i -g pm2
```

## 실행

> 프로젝트 root 경로에서 실행한다.

기본실행:

```bash
$ pm2 start dist/index.js --name "upbit-telegram-alarm"
```

실행시 로그파일 생성:

```bash
$ pm2 start dist/index.js --name "upbit-telegram-alarm" -o ./upbit-telegram-alarm.log -e ./upbit-telegram-alarm.log --merge-logs
```
