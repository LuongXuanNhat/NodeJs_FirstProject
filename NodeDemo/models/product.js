var SchemaProduct = require('../schema/product')

module.exports ={
    getall:function(products){
        var sort={};
        var Search={};
        if(products.sort){
            if(products.sort[0]=='-'){
                sort[products.sort.substring(1)]='desc';
            }else{
                sort[products.sort]='asc';
            }
        }
        if(products.key){
            Search.name= new RegExp(products.key,'i');
        }
        var limit = parseInt(products.limit)||2;
        var page = parseInt(products.page)||1;
        var skip = (page-1)*limit;
        return SchemaProduct.find(Search).sort(sort).limit(limit).skip(skip).exec();
    },
    getOne:function(id){
        return SchemaProduct.findById(id);
    },
    getByName:function (name){
        return SchemaProduct.findOne({name}).exec();
    },
    createProduct:function(product){
        return new SchemaProduct(product).save();
    },
    updateProductById:function(id,product){
        return SchemaProduct.findOneAndUpdate({ _id: id }, product, { new: true });
    },
    deleteProductById:function(id) {
        const update = { isDelete: true };
        return SchemaProduct.findOneAndUpdate({ _id: id }, update, { new: true });
    }
    
}