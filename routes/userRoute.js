const express = require('express');
const user_route = express()
const userController = require('../controllers/userController')
const auth = require('../middlewares/auth');
const admin_route = require('./adminRoute');
const session = require('express-session')
const configs = require('../config/config')


//setting up of session
user_route.use(session({
    secret:configs.sessionSecret,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:360000,
        sameSite:false,
    }
}))

//setting up of cache
user_route.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
 

 

//setting up view folder
user_route.set('views', './views/users')

//load guest home
user_route.get('/',userController.loadLanding)

//calling register page
user_route.get('/register',auth.isLogout,userController.loadRegister)

//calling Login page page
user_route.get('/login',auth.isLogout,userController.loadLogin)

//post request to insert user in register.
user_route.post('/register',userController.insertUser)

//Mail verification
user_route.get('/verify',userController.verifyMail)

//User Login
user_route.post('/login',userController.verifyLogin)

user_route.get('/forget',auth.isLogout ,userController.forgetLoad);

user_route.post('/forget',userController.forgetVerify);

user_route.get('/forgetpassword',auth.isLogout ,userController.forgetPassword);

user_route.post('/forgetpassword',userController.resetPassword);

//Load home page
user_route.get('/home',auth.isLogin,userController.loadHome)

//user logout 
user_route.get('/logoutuser',auth.isLogin,userController.userLogout)

//forgot user password
user_route.get('/forgotpassword',userController.Forgotpassword)

//product page
user_route.get('/productpage',auth.isLogin,userController.ProductPage)

user_route.get('/productpage1',userController.ProductPage)

//profile page of user
user_route.get('/userprofile',auth.isLogin,userController.loadProfile)

//add address in profile
user_route.get('/add-address',auth.isLogin,userController.loadAddress)

//adding new address
user_route.post('/add-address',auth.isLogin,userController.addAddress)

//delete existing address
user_route.get('/deleteaddress',auth.isLogin,userController.deleteAddress)

//load edit address page
user_route.get('/editaddress',auth.isLogin,userController.loadEditAddress)

//edit address
user_route.post('/editaddress',auth.isLogin,userController.editAddress)

//loading cart page
user_route.get('/cart',auth.isLogin,userController.loadCart)

//add product to cart
user_route.get('/addtocart',auth.isLogin,userController.addtoCart)

//remove product from cart
user_route.delete('/removecartproduct/:id',auth.isLogin,userController.removeCartProduct)

//edit profile page
user_route.get('/editprofile',auth.isLogin,userController.loadEditProfile)

//edit profile
user_route.post('/editprofile',userController.editProfile)

//user orders in profile
user_route.get('/userorders',auth.isLogin,userController.loadOrders)

//load checkout
user_route.post('/checkout',auth.isLogin,userController.loadCheckout)

//proceed to payment
// user_route.post('/placeOrder',auth.isLogin,userController.placeOrder)

//cancel the order
user_route.get('/cancelorder',userController.orderStatus)

//return the delivered order
user_route.get('/returnorder',userController.orderStatus)

user_route.post('/validateCoupon',auth.isLogin,userController.validateCoupon)

//  user_route.get('/payment',userController.payment)

// user_route.post('/payment',userController.placeOrder)

user_route.post('/place-order',userController.placeOrder)

//
user_route.post('/create/orderId',userController.ordergen);

user_route.post("/api/payment/verify",userController.siggen);

//category wise sorting of products
user_route.get('/categorywise',auth.isLogin,userController.CategoryProduct)

//load invoice in user orders 
user_route.get('/invoice',auth.isLogin,userController.invoice)

user_route.get('/add-address2',auth.isLogin,userController.checkoutAddress)

user_route.post('/add-address2',userController.addAddresscheck)

    
module.exports = user_route