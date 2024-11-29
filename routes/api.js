'use strict';

const { StockModel } = require("../mongooseModel");
require('dotenv').config();
const fccURLStock = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote'
async function getStock(stock){
  const res = await fetch(fccURLStock.replace('[symbol]',stock));
  const {symbol,latestPrice}  = await res.json();
  return {symbol,latestPrice};
}
function isNumeric(str){
  if (typeof str != "string") return false;
  return Number.isFinite(+str); 
};
function hashIP(ip=''){
  const hashKey = process.env.hashKey;
  const keyLength = hashKey.length;
  const ipArr = ip.split('');
  for(let i=0,indexKey=0;i<ip.length;i++){
    if(isNumeric(ipArr[i])){
      ipArr[i] = ((Number(ipArr[i])+Number(hashKey[indexKey]))%10).toString();
      indexKey = ((indexKey+1)%keyLength);
    }
  }
  return ipArr.join('');
}
async function findStock(stock){
  const data = await StockModel.findOne({symbol:stock}).exec();
  return data;
}
async function saveStock(stock,like,ip){
  let saved = {};
  const foundStock = await findStock(stock);
  if(!foundStock){
    saved = await createStock(stock,like,ip);
  }else{
    if(like && foundStock.likes.indexOf(ip)===-1){
      foundStock.likes.push(ip);
    }
    saved = await foundStock.save();
  }
  return saved;
}
async function createStock(stock,like,ip){
  const stockModel = new StockModel({symbol:stock,likes:like?[ip]:[]});
  const saveData = await stockModel.save();
  return saveData;
}

async function singleStockHandle(stock,like,ip){
  const {symbol,latestPrice} = await getStock(stock);
  if(!symbol){
    return {stockData:{likes:like?1:0}};
  }
  const stockData = await saveStock(symbol,like,ip);
  return {
      stock:symbol,
      price:latestPrice,
      likes:stockData.likes.length,
  };
}
async function multStockHandle(stocks=[''],like,ip){
  const stockDatas =  await Promise.all(stocks.map(stock=>singleStockHandle(stock,like,ip)));
  return stockDatas.map((data,i)=>{
    const {stock,price,likes} = data;
    return {
      stock,
      price,
      rel_likes:likes-stockDatas[i%stockDatas.length].likes,
    }
  })
}
module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(async function (req, res){
      const {stock,like} = req.query;
      if(!stock){
        return res.send('Missing stock');
      }
      let data = {};
      const ip = hashIP(req.ip);
      if(Array.isArray(stock)){
        data = await multStockHandle(stock,like==='true',ip);
      }else{
        data = await singleStockHandle(stock,like==='true',ip);
      }
      res.json({
        stockData:data
      });
    });
    
};
