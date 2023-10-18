'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const {getInfoData} = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const keytokenModel = require("../models/keytoken.model")

const RoleShop = {
    SHOP: 'SHOP',
    WRITTER: 'WRITTER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}
class AccessService {

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById({id: keyStore._id})
        console.log({delKey})
        return delKey
    }

    /*
        1 - check email in dbs
        2 - match password
        3 - create AT & RT and save
        4 - generate token
        5 - get data return login
    */
    static login = async ({email, password, refreshToken = null}) => {
        // 1.
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered!')

        // 2. 
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')

        // 3.
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // 4. 
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken, 
            publicKey, privateKey, userId
        })
        return {
            shop: getInfoData({fileds: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }
    static signUp = async ({name, email, password}) => {
        // try {
            //step1: check email exists??
            const holderShop = await shopModel.findOne({email}).lean()

            if(holderShop) {
                // return {
                //     code: 'xxxx',
                //     message: 'Shop already registered!'
                // }
                throw new BadRequestError('Error: Shop already registered!')
            }
            const passwordHash = await bcrypt.hash(password, 10) //băm password
            
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop) {
                //created privateKey, publicKey
                // !!! Nang cao
                // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         //public key cryptoragphy standards
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         //public key cryptoragphy standards
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                // !!! Co ban
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({privateKey, publicKey}) // save collection KeyStore

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore) {
                    return {
                        code: 'xxxx',
                        message: 'keyStore error'
                    }
                }

                //created  token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }
            return {
                code: 200, 
                metadata: null
            }
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService