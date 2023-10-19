'use strict'

const {product, clothing, electronic} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')

//define factory class to create product
class ProductSerivice {
    static async createProduct(type, payload) {
        switch(type) {
            case 'Clothing': 
                return new Clothing(payload).createProduct()
            case 'Electronic':
                return new Electrnic(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Type ${type}`)
        }
    }

}

//define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, product_quantity,
        product_shop, product_attributes, product_type
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_type = product_type
    }

    async createProduct(product_id) {
        return await product.create({...this, _id: product_id})
    }
}

//define sub-class for different product type Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw new BadRequestError('create new clothing error')

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError('create new product error')

        return newProduct
    }
}
//define sub-class for different product type Electrnic
class Electrnic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError('create new electronic error')

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError('create new product error')

        return newProduct
    }
}

module.exports = ProductSerivice