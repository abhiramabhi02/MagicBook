const res = require("express/lib/response");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const product = require("../models/productModel");
const { ObjectID, ObjectId } = require("bson");
const { findByIdAndUpdate } = require("../models/userModel");
const messages = require("../Helpers/Messages");
const randomstring = require("randomstring");
const Order = require("../models/orderModel");
const razorPay = require("razorpay");
const moment = require("moment");
const Coupon = require("../models/couponModel");
const category = require("../models/categoryModel");
const config = require("../config/config");
const otpGenerator = require("otp-generator");

const Razorpay = require("razorpay");
const couponModel = require("../models/couponModel");
var instance = new Razorpay({
  key_id: "rzp_test_HoTBsfjjQ8ECAO",
  key_secret: "CikqxlzfB7I5niniFH1j0Jqk",
});

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//function for sending verification mail
const sendVerifyMail = async (firstname, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "magicbookweb@gmail.com",
        pass: "bdiftmitgvgipeis",
      },
    });
    const mailOption = {
      from: "magicbookweb@gmail.com",
      to: email,
      subject: "Verification Mail",
      html:
        "<p>Hello " +
        firstname +
        ' Please click here to <a href="http://magicbookstores.online/verify?id=' +
        user_id +
        '">verify</a> your email.</p>',
    };
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent -", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// reset mail for forgot password
const resetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "magicbookweb@gmail.com",
        pass: "bdiftmitgvgipeis",
      },
    });

    const mailOptions = {
      from: "magicbookweb@gmail.com",
      to: email,
      subject: "For Reset password",
      html:
        "<p>Hii " +
        name +
        ' please click here to <a href="http://magicbookstores.online/forgetpassword?token=' +
        token +
        '"> Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const otpMail = async (firstname, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "magicbookweb@gmail.com",
        pass: "bdiftmitgvgipeis",
      },
    });
    const mailOption = {
      from: "magicbookweb@gmail.com",
      to: email,
      subject: "OTP for Login",
      html: "<p>Your otp for login " + firstname + "  " + otp + "</p>",
    };
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent -", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//function for rendering registration page
const loadRegister = async (req, res) => {
  try {
    const errorMessage = await req.session.errorMessage;

    const message = await req.session.Message;
    res.render("registration",{noh: true, errorMessage, message});
    delete req.session.errorMessage;
    delete req.session.Message;
  } catch (error) {
    console.log(error.message);
  }
};
//function for rendering Landing page
const loadLanding = async (req, res) => {
  try {
    const productData = await product.find();
    res.render("guesthome", { Product: productData, log: true });
  } catch (error) {
    console.log(error.message);
  }
};

//function for rendering login Page
const loadLogin = async (req, res) => {
  try {
    
    const errorMessage = await req.session.errorMessage;

    const message = await req.session.Message;

    res.render("login", { noh: true, errorMessage, message });
    delete req.session.errorMessage;
    delete req.session.Message;
  } catch (error) {
    console.log(error.message);
  }
};

// function for user registration

const insertUser = async (req, res) => {
  console.log(
    "password" + req.body.password + "  cpass  " + req.body.cpassword
  );
  try {
    const checkUser = await User.findOne({ Email: req.body.email });
    if (!checkUser) {
      if (req.body.password === req.body.cpassword) {
        const spassword = await securePassword(req.body.password);
        const user = new User({
          Firstname: req.body.firstname,
          Lastname: req.body.lastname,
          Email: req.body.email,
          Password: spassword,
        });

        const userData = await user.save();

        if (userData) {
          sendVerifyMail(req.body.firstname, req.body.email, userData._id);

          req.session.Message = messages.Registrationsuccess,
          res.redirect("/login");
        } else {
          req.session.errorMessage = messages.RegistrationFailed
          res.redirect("/register");
        }
      } else {
        req.session.errorMessage = messages.passAndCpass
        res.redirect("/register");
      }
    } else {
      req.session.errorMessage = messages.existingMail
      res.redirect("/register");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//forgot password page
const forgetLoad = async (req, res) => {
  try {
    res.render("forget", { noNav: 1 });
  } catch (error) {
    console.log(error.message);
  }
};

//Mail Verification of new user
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );

    res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};

//Function for login of user

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ Email: email });

    if (userData && userData.Block == false) {
      const passwordMatch = await bcrypt.compare(password, userData.Password);
      if (passwordMatch) {
        if (userData.is_verified === 0) {
          req.session.Message = messages.VerifyMail;
          res.redirect("/login");
        } else {
          req.session.user_id = userData._id;
          res.redirect("/home");
        }
      } else {
        req.session.errorMessage = messages.incorrectCredentials;
        res.redirect("/login");
      }
    } else {
      req.session.errorMessage = messages.incorrectOrBlocked;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load homepage
const loadHome = async (req, res) => {
  try {
    const categoryData = await category.find();
    const productData = await product.find();
    res.render("home", { Product: productData, category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

//user logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//load products
const loadProducts = async (req, res) => {
  try {
    const productData = await product.find();
    res.render("products", { products: productData });
  } catch (error) {
    console.log(error.message);
  }
};

const Forgotpassword = async (req, res) => {
  try {
    res.render("forgetPassword", { log: true });
  } catch (error) {
    console.log(error.message);
  }
};

//forgot verify
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ Email: email });

    if (userData) {
      if (userData.is_verified === 0) {
        res.render("forget", { message: "Please verify your mail id" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { Email: email },
          { $set: { token: randomString } }
        );
        resetPasswordMail(userData.Name, userData.Email, randomString);
        res.render("forget", {
          log: true,
          correct: true,
          message:
            "reset password link has been sent to your registered mail id ",
        });
      }
    } else {
      res.render("forget", { log: true, message: "User email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//forgot password
const forgetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("forgetPassword", { log: true, user_id: tokenData._id });
    } else {
      res.render("404", { log: true, message: "Invalid token" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_Password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { Password: secure_Password, token: "" } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const ProductPage = async (req, res) => {
  try {
    const id = ObjectId(req.query.id);
    const productData = await product.findById({ _id: id });
    res.render("productpage", { products: productData });
  } catch (error) {
    console.log(error.message);
  }
};

const loadProfile = async (req, res) => {
  try {
    const userData = await User.find({ _id: req.session.user_id }).lean();
    res.render("profile", { user: userData, address: userData[0].Address });
  } catch (error) {
    console.log(error.message);
  }
};

//load user orders in user profile
const loadOrders = async (req, res) => {
  const order = await Order.find({ userId: req.session.user_id }).sort({
    date: -1,
  });

  res.render("userOrder", { order: order });
};

const loadAddress = async (req, res) => {
  try {
    res.render("add-address");
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    const address = await User.findByIdAndUpdate(
      { _id: ObjectId(req.session.user_id) },
      { $addToSet: { Address: req.body } }
    );
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: req.session.user_id },
      {
        $pull: {
          Address: { _id: id },
        },
      }
    );
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const addressData = userData.Address.filter((element) => {
      if (element._id == req.query.id) {
        return element;
      }
    });
    const address = addressData[0];

    console.log(userData.Address[0]);
    res.render("edit-address", { address });
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const id = req.query.id;

    const Data = await User.findOne({ _id: req.session.user_id });

    const index = Data.Address.findIndex((val) => val._id == id);
    console.log(index, "12 400");

    const userData = await User.findOneAndUpdate(
      { _id: req.session.user_id, "Address._id": id },
      {
        $set: {
          [`Address.${index}`]: {
            index,
            _id: id,
            name: req.body.name,
            number: req.body.number,
            house: req.body.house,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
          },
        },
      },
      { new: true }
    );

    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

//load cart page
const loadCart = async (req, res) => {
  try {
    const cartData = await User.aggregate([
      { $match: { _id: ObjectId(req.session.user_id) } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "Cart",
        },
      },
    ]);
    const cartProducts = cartData[0].Cart;
    let subtotal = 0;
    cartProducts.forEach((cartProduct) => {
      subtotal = subtotal + Number(cartProduct.Price);
    });

    res.render("cart2", { cartProducts, subtotal, total: subtotal });
  } catch (error) {
    console.log(error.message);
  }
};
//add to cart
const addtoCart = async (req, res) => {
  try {
    const cartData = await User.updateOne(
      { _id: req.session.user_id },
      {
        $addToSet: {
          cart: { productId: req.query.id },
        },
      }
    );

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

//delete products from cart
const removeCartProduct = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.session.user_id },
      {
        $pull: {
          cart: { productId: req.params.id },
        },
      }
    );
    res.json("success");
  } catch (error) {
    console.log(error.message);
  }
};

//edit profile
const loadEditProfile = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("edit-profile", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//profile edit
const editProfile = async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;

    const userData = await User.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          Firstname: firstname,
          Lastname: lastname,
          Email: email,
        },
      }
    );
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

let gtotal;

const loadCheckout = async (req, res) => {
  try {
    const address = await User.find({ _id: req.session.user_id });

    const cartData = await User.aggregate([
      {
        $match: { _id: ObjectId(req.session.user_id) },
      },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "cart",
        },
      },
    ]);
    let total = 0;
    gtotal = 0;
    const cartProducts = cartData[0].cart;
    cartProducts.map((cartProduct, i) => {
      cartProduct.quantity = req.body.quantity[i];
      total = total + cartProduct.Price * req.body.quantity[i];
      gtotal = total;
    });

    res.render("checkout", {
      productDetails: cartData[0].cart,
      subtotal: total,
      gtotal: total,
      offer: 0,
      userAddress: address[0].Address,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const orderStatus = async (req, res) => {
  const orderData = await Order.findOne({ _id: req.query.id });

  if (orderData.status === "Delivered") {
    const returnOrder = await Order.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          status: "Returned",
        },
      }
    );
    res.redirect("/userorders");
  } else if (orderData.status === "Processing") {
    const CancelOrder = await Order.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          status: "Cancelled",
        },
      }
    );
    res.redirect("/userorders");
  }
};

let globalCoupon;
let globalCouponAmount;

const placeOrder = async (req, res) => {
  try {
    const {
      productid,
      productname,
      payment,
      price,
      quantity,
      addressId,
      total,
    } = req.body;
    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;
    const datetime = new Date();
    const Total = total;
    const magicbookproduct = productid.map((item, i) => ({
      id: productid[i],
      name: productname[i],
      price: price[i],
      quantity: quantity[i],
    }));

    if (req.body.coupon) {
      globalCoupon = req.body.coupon;
      const couponApplied = await Coupon.findOne({
        code: req.body.coupon,
      });
      globalCouponAmount = couponApplied.percentage;
      if (globalCouponAmount && Total) {
        const amount = (Total * globalCouponAmount) / 100;
        gtotal = Total - amount;
      } else {
        gtotal = Total;
      }
    }

    let data = {
      userId: ObjectId(req.session.user_id),
      orderId: orderId,
      date: datetime,
      addressId: addressId,
      product: magicbookproduct,
      status: "Processing",
      payment_method: String(payment),
      total: gtotal,
    };

    const orderPlacement = await Order.insertMany(data);
    console.log(orderPlacement);
    const clearCart = await User.updateOne(
      {
        _id: req.session.user_id,
      },
      {
        $set: {
          cart: [],
        },
      }
    );
    quantity.map(async (item, i) => {
      const reduceStock = await product.updateOne(
        { _id: ObjectId(productid[i]) },
        {
          $inc: {
            quantity: -Number(item),
          },
        }
      );
    });

    if (orderPlacement && clearCart) {
      console.log(1);
      res.json("success");
    } else {
      console.log(2);
      const handlePlacementissue = await Order.deleteMany({ orderId: orderId });

      res.json("try again");
    }
  } catch (error) {
    console.log(3);
    console.log(error.message);
    res.json("try again");
  }
};

const ordergen = async (req, res) => {
  console.log("Create OrderId Request", req.body);
  var options = {
    amount: req.body.amount, // amount in the smallest currency unit
    currency: "INR",
    receipt: "rcp1",
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({ orderId: order.id }); //EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
  });
};

const siggen = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto
    .createHmac("sha256", "CikqxlzfB7I5niniFH1j0Jqk")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};
//  expectedSignature === req.body.response.razorpay_signature

const validateCoupon = async (req, res) => {
  try {
    const codeId = req.body.code;

    const total = req.body.total;
    console.log(total, "req");

    const couponData = await Coupon.findOne({ code: codeId }).lean();

    const userData = await Coupon.findOne({
      code: codeId,
      userId: req.session.user_id,
    }).lean();

    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      offerPrice = couponData.percentage;

      if (userData) {
        res.json("fail");
      } else {
        let amount = (total * offerPrice) / 100;
        gtotal = total - amount;
        console.log(gtotal, "23r g");

        const CouponData = await Coupon.updateOne(
          { code: codeId },
          { $push: { userId: req.session.user_id } }
        );
        res.json({ gtotal, offerPrice });
      }
    } else {
      res.json("fail");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const CategoryProduct = async (req, res) => {
  try {
   const categoryData = await category.find();
    let categoryproduct = await product.find({ Category: req.query.id });
    if (categoryproduct) {
      res.render("home", {
        Product: categoryproduct,
        category: categoryData,
      });
      //Product,category
    }
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req, res) => {
  try {
    const id = req.query.id;
    const invoiceData = await Order.find({ _id: id });

    const date2 = moment(invoiceData.date).format("DD-MM-YYYY");

    res.render("invoice", { invoiceData, date2 });
  } catch (error) {
    console.log(error.message);
  }
};

const checkoutAddress = async (req, res) => {
  try {
    res.render("add-address2");
  } catch (error) {
    console.log(error.message);
  }
};

const addAddresscheck = async (req, res) => {
  try {
    const data = { Name, mobile, house, city ,state ,pin} = req.body
    console.log(data, "data json");
    const address = await User.findByIdAndUpdate(
      { _id: ObjectId(req.session.user_id) },
      { $addToSet: { 
        Address:{
          name: req.body.Name,
          number: req.body.mobile,
          house: req.body.house,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
        }
       } }
    );
    res.json("success")
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtpLogin = async (req, res) => {
  try {
    res.render("otplogin", { noh: true });
  } catch (error) {
    console.log(error.message);
  }
};

const otpLogin = async (req, res) => {
  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const email = req.body.email;

    const userData = await User.findOneAndUpdate(
      { Email: email },
      {
        $set: {
          token: otp,
        },
      }
    );

    if (userData) {
      otpMail(userData.Firstname, userData.Email, otp);

      res.render("otplogin2");
    } else {
      res.render("otplogin", { message: "valla pannikum poda" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginWithOtp = async (req, res) => {
  try {
    console.log("logged at login with otp");

    const email = req.body.email;
    const otp = req.body.otp;
    const userData = await User.findOne({ Email: email });

    console.log(userData, " logged at 918");

    if (userData && userData.Block == false) {
      console.log("logged at 921");
      if (userData.token == otp) {
        if (userData.is_verified === 0) {
          res.render("otplogin2", { error: messages.VerifyMail });
        } else {
          console.log("in at 926");
          req.session.user_id = userData._id;
          res.redirect("home");

          const updateToken = await User.updateOne(
            { Email: email },
            {
              $set: {
                token: "",
              },
            }
          );
        }
      }
    } else {
      res.render("otplogin2", { error: messages.incorrectOrBlocked });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderMainLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Order.findOne({ _id: id });

    console.log(order);

    const date2 = moment(order.date).format("DD-MM-YYYY");

    res.render("userOrdersMain", { order, date2 });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLanding,
  loadRegister,
  loadLogin,
  insertUser,
  verifyMail,
  verifyLogin,
  loadHome,
  userLogout,
  loadProducts,
  Forgotpassword,
  ProductPage,
  loadProfile,
  loadAddress,
  addAddress,
  deleteAddress,
  loadEditAddress,
  editAddress,
  loadOrders,
  loadCart,
  addtoCart,
  removeCartProduct,
  loadEditProfile,
  editProfile,
  loadCheckout,
  resetPasswordMail,
  forgetLoad,
  forgetVerify,
  forgetPassword,
  resetPassword,
  // placeOrder,
  orderStatus,
  // payment
  placeOrder,
  ordergen,
  siggen,
  validateCoupon,
  CategoryProduct,
  invoice,
  checkoutAddress,
  addAddresscheck,
  loadOtpLogin,
  otpLogin,
  loginWithOtp,
  orderMainLoad,
};
