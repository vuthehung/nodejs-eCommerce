'use strict'

const ProductSerivice = require('../services/product.service')
const {SuccessResponse} = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Product Success',
            metadata: await ProductSerivice.createProduct(req.body.product_type, req.body)
        }).send(res)
    }
}


module.exports = new ProductController()