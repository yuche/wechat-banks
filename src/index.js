const axios = require('axios');
const async = require('async');
const fs = require('fs');
const qs = require('qs');
const bankTypes = require('../bankType');
const provinces = require('../provinces');
const cities = require('../cities');

const MERCHANT_ID = 123456; // 商户 ID
const TOKEN = '';
const COOKIE = '';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const request = axios.create({
  baseURL: 'https://pay.weixin.qq.com',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2743.82 Safari/537.36',
    'Cookie': COOKIE
  }
});

let requestParamsList = [];

bankTypes.forEach((bank) => {
  let data = {};
  data.bankId = bank.value;
  provinces.forEach((province) => {
    data.provinceId = province.value;
    province.children.forEach((city) => {
      const { code } = cities.find(item => city.name.includes(item.name)) || { code: 0 };
      requestParamsList.push(Object.assign({}, data, {
        'ecc_csrf_token': TOKEN,
        'merchantId': MERCHANT_ID,
        'cityId': city.value,
        'mode': 3,
        'name': city.name,
        code
      }));
    });
  });
});

let JSONtoBeSave = [];

let errorCount = 0;
let successCount = 0;

async.eachSeries(requestParamsList, (params, cb) => {
  request
    .post('/index.php/core/applymentnew/query_bank_list', qs.stringify({
      'ecc_csrf_token': TOKEN,
      'merchantId': MERCHANT_ID,
      'mode': 3,
      'bankId': params.bankId,
      'provinceId': params.provinceId,
      'cityId': params.cityId
    }))
    .then(res => {
      return res.data;
    })
    .then(res => {
      if (res.errorcode !== 0) {
        cb(res.msg);
      }
      return res.data.map(item => {
        delete params.ecc_csrf_token;
        delete params.merchantId;
        delete params.mode;
        return Object.assign({}, item, params);
      });
    })
    .then(json => {
      successCount += 1;
      if (json && Array.isArray(json) && json.length > 0) {
        JSONtoBeSave.concat(json);
      }
      cb();
    })
    .catch(err => {
      errorCount += 1;
      console.log(`出现错误 ${errorCount} 次`);
      console.log(JSON.stringify(err));
    })
    .then(() => {
      console.log(`成功请求 ${successCount} 次，还剩 ${requestParamsList.length - successCount - errorCount} 次`);
    })
}, () => {
  fs.appendFileSync('./data/all.json', JSON.stringify(JSONtoBeSave));
  console.log(`出现错误 ${errorCount} 次`);
  console.log(`成功请求 ${successCount} 次，获得 ${JSONtoBeSave.length} 条银行数据`);
  console.log('done');
});
