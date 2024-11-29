const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Viewing one stock',(done)=>{
        chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG').end((err,res)=>{
            assert.equal(200,res.status);
            assert.isNumber(res.body.stockData.price,'Price need to be a number');
            assert.equal(res.body.stockData.stock,'GOOG','stock need to be GOOG');
            done();
        })
    })
    test('Viewing one stock and liking it',(done)=>{
        chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG&like=true').end((err,res)=>{
            assert.equal(200,res.status);
            assert.isNumber(res.body.stockData.price,'Price need to be a number');
            assert.equal(res.body.stockData.stock,'GOOG','stock need to be GOOG');
            assert.isAtLeast(res.body.stockData.likes,1,'Likes need to be greater than 1');
            done();
        })
    })
    test('Viewing one stock and liking it again',(done)=>{
        chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG&like=true').end((err,res)=>{
            let likes = 0;
            assert.equal(200,res.status);
            assert.isNumber(res.body.stockData.price,'Price need to be a number');
            assert.equal(res.body.stockData.stock,'GOOG','stock need to be GOOG');
            likes = res.body.stockData.likes;
            chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG&like=true').end((err,res)=>{
                assert.equal(res.body.stockData.likes,likes,'Likes do not increment if like again');
                done();
            })
        })
    })
    test('Viewing two stock',(done)=>{
        chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG&stock=MSFT').end((err,res)=>{
            assert.equal(200,res.status);
            assert.isArray(res.body.stockData);
            assert.lengthOf(res.body.stockData,2);
            assert.equal(res.body.stockData[0].stock,'GOOG');
            assert.equal(res.body.stockData[1].stock,'MSFT');
            assert.isNumber(res.body.stockData[0].rel_likes);
            assert.isNumber(res.body.stockData[1].rel_likes);
            done();
        })
    })
    test('Viewing two stocks and liking them',(done)=>{
        chai.request(server).keepOpen().get('/api/stock-prices?stock=GOOG&stock=MSFT').end((err,res)=>{
            assert.equal(200,res.status);
            assert.isArray(res.body.stockData);
            assert.lengthOf(res.body.stockData,2);
            assert.equal(res.body.stockData[0].stock,'GOOG','First stock need to be GOOG');
            assert.equal(res.body.stockData[1].stock,'MSFT','Second stock need to be MSFT');
            assert.isNumber(res.body.stockData[0].rel_likes,'rel_likes is a number');
            assert.isNumber(res.body.stockData[1].rel_likes,'rel_likes is a number');
            done();
        })
    })
});
