# wechat-banks

从微信商户后台爬出来的全国各地银行数据，共计 101370 条。你可以 [点击这里](https://raw.githubusercontent.com/yuche/wechat-banks/master/data/banks.json) 下载。

## 使用方法
该 JSON 压缩后仍然有 17M 的大小，不推荐直接在客户端使用。你应该导入服务器数据库，让客户端通过 api 请求对应银行类型和地址的银行信息。

```javascript
// 分别得到适配微信商户银行数据的银行类型，省份，城市列表
import { bankTypes, cities, provinces } from 'wechat-banks'
```

## 数据结构


### 银行列表 data/banks.json

```javascript
{
    "subBranchId": 116568,
    "subBranchName": "中国邮政储蓄银行股份有限公司陕西省渭南市白水县东风路支行",
    "provinceId": "27",
    "code": "610500", // 行政区划代码
    "name": "渭南", // 银行所在的地级行政单位名称
    "cityId": "913", 
    "bankId": "1066"
}
...
```

### bankTypes

银行的类型

```javascript
{
    "value": "1001", // 银行的 ID，对应银行列表的 bankId
    "name": "招商银行", // 银行名称
    "accNoParttern": [/^(\d{13}|\d{15,21})$/, /^(\d{10}|\d{12}|\d{15,16})$/] // 匹配正则
}
...
```

### provinces

中国省级行政区

```javascript
{
    "name": "重庆市",
    "value": "4", // 省份的 ID，对应银行列表的 provinceId
    "children": [
        {"name": "重庆", "value": "23"},
        {"name": "涪陵市", "value": "230"},
        {"name": "万州市", "value": "231"},
        {"name": "黔江市", "value": "232"}
    ]
}
...
```

### cities

中国地级行政区

```javascript
{
    "id": "132",
    "name": "承德",
    "parent_id": "5", // 对应省级行政区 provinces 的 value
    "first_letter": "c",
    "shorthand": "cd",
    "pinyin": "chengde",
    "suffix": "市",
    "code": "130800", // 行政区划代码
    "sort": "8"
},
```

## 自行爬数据

src 文件夹下有源代码。请确保你的 Node.js 版本大于 v4。然后：

1. `npm install` 安装依赖；
2. 进入微信商户后台管理页面；
3. 打开 chrome dev tools 或者其他抓包工具；
4. 进行一次真实的银行名称的选取（选类型 > 省份 > 城市），拿到你的 MERCHANT_ID，COOKIE 和 TOKEN；
5. 替换掉 index.js [第 9 行到第 11 行](https://github.com/yuche/wechat-banks/blob/master/src/index.js#L9-L11)的内容；
6. 终端运行 node index.js

由于脚本是 2016 年初写的，不保证微信的 api 是否有变化。如果一切顺利，你大概请求 9800 次微信服务器就可以得到完整数据。

请求策略是继发请求，你也可以使用 `async` 的 `eachLimit` 或者 `bluebird` 的 `Promise.map` 控制并发，节约一点时间。


