require('dotenv').config()
const sessionSecret = process.env.sessionSecretcode

const email = process.env.user
const password = process.env.pass

module.exports={
    sessionSecret,
    email, password
}