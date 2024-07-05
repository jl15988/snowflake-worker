# SnowflakeWorker

[![License](https://img.shields.io/npm/l/snowflake-worker?color=5470c6)](https://github.com/jl15988/snowflake-worker/blob/master/LICENSE) [![Latest npm release](https://img.shields.io/npm/v/snowflake-worker?color=91cc75)](https://www.npmjs.com/package/snowflake-worker) [![NPM downloads](https://img.shields.io/npm/dm/snowflake-worker.svg?label=npm%20downloads&style=flat&color=fac858)](https://www.npmjs.com/package/snowflake-worker)

一个 JavaScript 或 Node 雪花 ID 生成器。
A JavaScript or Node snowflake ID generator.

## 安装

npm 安装
```sh
npm i snowflake-worker -S
```

yarn 安装
```sh
yarn add snowflake-worker -S
```

pnpm 安装
```sh
pnpm i snowflake-worker -S
```

## 使用

```js
import SnowflakeWorker from 'snowflake-worker'

const snowflakeWorker = new SnowflakeWorker(1, 1)
const snowflakeId = snowflakeWorker.nextId()

// 或者使用全局唯一雪花对象（全局唯一雪花对象一经创建后不能被修改，重复调用 global 方法不会覆盖）
const snowflakeWorkerGlobal = SnowflakeWorker.global(1, 1)
const snowflakeId2 = snowflakeWorkerGlobal.nextId()
```
