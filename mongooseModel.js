const mongoose = require('mongoose');
mongoose.connect(process.env.DB).then((res)=>console.log('Database connected '));
const StockModel = mongoose.model('Stock',new mongoose.Schema({
    symbol:{type:String,required:true,index:true},
    likes:{type:[String],defaul:[]},
}));
module.exports ={
    StockModel,
}