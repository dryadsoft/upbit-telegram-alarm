# upbit-telegram-alarm

npm 사용:

```bash
$ npm i upbit-telegram-alarm
```

yarn 사용:

```bash
$ yarn add upbit-telegram-alarm
```

프로젝트 dependencies 패키지 설치

```shell
$ yarn install
또는
$ npm install
```

pm2 패키지 설치

```shell
$ yarn global add pm2
또는
$ npm i -g pm2
```

실행

- 프로젝트 root 경로에서 실행한다.

```shell
$ pm2 start lib/index.js --name "upbit-telegram-alarm"
```

- 실행시 로그생성

```shell
$ pm2 start lib/index.js --name "upbit-telegram-alarm" -o ./upbit-telegram-alarm.log -e ./upbit-telegram-alarm.log --merge-logs
```
