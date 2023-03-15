const admin = require("../models/adminModel");
const product = require("../models/productModel");
const user = require("../models/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel");
const { ObjectId } = require("mongodb");
const messages = require("../Helpers/Messages");
const Order = require("../models/orderModel");
const coupon = require("../models/couponModel");

//encryption
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//admin Login
const adminLogin = async (req, res) => {
  try {
    res.render("adminLogin", { noh: true });
  } catch (error) {
    console.log(error.message);
  }
};
// Admin registration
const adminRegistration = async (req, res) => {
  try {
    res.render("adminRegistration", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

//admin registration
const newAdmin = async (req, res) => {
  try {
    if (req.body.password === req.body.cpassword) {
      const spassword = await securePassword(req.body.password);
      const Admin = new admin({
        Firstname: req.body.firstname,
        Lastname: req.body.lastname,
        Email: req.body.email,
        Password: spassword,
      });

      const adminData = await Admin.save();
      if (adminData) {
        res.render("adminLogin", { message: messages.Registrationsuccess });
      } else {
        res.render("adminRegistration", {
          message: messages.RegistrationFailed,
        });
      }
    } else {
      res.render("registration", {
        message: messages.passAndCpass,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//admin dashboard loading
const adminDashboard = async (req, res) => {
  try {
    const userData = await user.find({}).count();
    const orderData1 = await Order.find({ payment_method: 1 }).count();
    const orderData2 = await Order.find({ payment_method: 2 }).count();
    const orderData = orderData1 + orderData2;

    const productData = await product.find({}).count();

    res.render("adminDashboard", {
      admin: true,
      userData,
      orderData,
      productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//admin login verification
const verifyAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await admin.findOne({ Email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.Password);
      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/admin");
      } else {
        res.render("adminLogin", { error: messages.incorrectCredentials });
      }
    } else {
      res.render("adminLogin", { error: messages.incorrectCredentials });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//product page
const loadProducts = async (req, res) => {
  try {
    const productData = await product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "Category",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);

    console.log(productData, "123 cate");

    const categoryData = await Category.find();
    res.render("products", {
      admin: true,
      products: productData,
      category: categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const viewfullproducts = async (req, res) => {
  try {
    const productData = await product.findOne({ _id: req.query.id });
    console.log(productData, "pro");

    res.render("productFull", {
      admin: true,
      products: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//insert new product page
const addProduct = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("addProduct", { Category: categoryData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

// insert new product
const insertproduct = async (req, res) => {
  try {
    const Product = new product({
      Image: req.file.filename,
      Name: req.body.name,
      Description: req.body.description,
      Category: req.body.category,
      Price: req.body.price,
      Stock: req.body.stock,
    });

    const productData = await Product.save();
    if (productData) {
      res.redirect("/admin/products");
    } else {
      res.redirect("/admin/addproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load users page
const loadUsers = async (req, res) => {
  try {
    const userData = await user.find();
    res.render("users", { admin: true, users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//delete product
const deleteProduct = async (req, res) => {
  try {
    const productData = await product.deleteOne({ _id: req.query.id });
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

//edit product page
const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.find();
    const productData = await product.findById({ _id: id });
    if (productData) {
      res.render("editProduct", {
        admin: true,
        products: productData,
        Category: categoryData,
      });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//edit product
const updateProduct = async (req, res) => {
  try {
    const id = req.body.id;
    if (req.file) {
      const productData = await product.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            Image: req.file.filename,
            Name: req.body.name,
            Description: req.body.description,
            Category: req.body.category,
            Price: req.body.price,
            Stock: req.body.stock,
          },
        }
      );
      if (productData) {
        res.redirect("/admin/products");
      }
    } else {
      const productData = await product.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            Name: req.body.name,
            Description: req.body.description,
            Category: req.body.category,
            Price: req.body.price,
            Stock: req.body.stock,
          },
        }
      );
      if (productData) {
        res.redirect("/admin/products");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//user block
const blockUser = async (req, res) => {
  try {
    const userData = await user.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          Block: true,
        },
      }
    );
    if (userData) {
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//user block
const UnblockUser = async (req, res) => {
  try {
    const userData = await user.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          Block: false,
        },
      }
    );
    if (userData) {
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load category page
const loadCategory = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const errorMessage = await req.session.errorMessage;
    res.render("category", { admin: true, Category: categoryData, errorMessage });
    delete req.session.errorMessage
  } catch (error) {
    console.log(error.message);
  }
};

//add new category page
const addCategory = async (req, res) => {
  try {
    res.render("add-category", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

//insert new category
const insertCategory = async (req, res) => {
  try {
    const checkSameName = await Category.findOne({ Name: req.body.name });
    console.log(checkSameName);

    if (checkSameName) {
      req.session.errorMessage =  messages.existingCategory,
      res.redirect("/admin/category");
    } else {
      const category = new Category({
        Name: req.body.name,
      });

      const categoryData = await category.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//edit category page
const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    const errorMessage = await req.session.errorMessage;
    res.render("edit-category", { Category: categoryData, admin: true, errorMessage });
    delete req.session.errorMessage
  } catch (error) {
    console.log(error.message);
  }
};

//update category
const updateCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const categoryName = await Category.findOne({Name: name})
 
    if(categoryName){
      req.session.errorMessage = messages.existingCategory
      res.redirect('/admin/category')
    }else{
      const id = req.body.id
      console.log(id," id");
      const categoryData = await Category.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            Name: name,
          },
        }
      );
    }
   
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//delete category
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.deleteOne({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//load orders page
const loadOrders = async (req, res) => {
  try {
    const orderData = await Order.find();
    res.render("orders", { order: orderData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const OrderProducts = async (req, res) => {
  try {
    const orderData = await Order.find({ _id: req.query.id });
    res.render("orderProduct", { order: orderData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

//admin logout
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/adminlogin");
  } catch (error) {
    console.log(error.message);
  }
};

const orderStatus = async (req, res) => {
  const orderData = await Order.findOne({ _id: req.query.id });

  if (orderData.status === "Processing") {
    const shipOrder = await Order.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          status: "Shipped",
        },
      }
    );
  } else if (orderData.status === "Shipped") {
    const deliverOrder = await Order.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          status: "Delivered",
        },
      }
    );
  }
  res.redirect("/admin/orders");
};

//coupon in admin
const loadCoupons = async (req, res) => {
  try {
    const couponData = await coupon.find();

    res.render("coupons", { admin: true, coupon: couponData });
  } catch (error) {
    console.log(error.message);
  }
};

//add new coupon
const addCoupon = async (req, res) => {
  try {
    res.render("add-coupon", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const insertCoupon = async (req, res) => {
  try {
    const Coupon = new coupon({
      code: req.body.code,
      date: req.body.date,
      percentage: req.body.percent,
    });
    const couponData = await Coupon.save();

    if (couponData) {
      res.redirect("/admin/coupons");
    } else {
      res.redirect("/admin/addcoupons");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCoupon = async(req,res)=>{
  try {
    const id = req.query.id
    const delcoupon = await coupon.deleteOne({_id:id})
    res.redirect('/admin/coupons')
  } catch (error) {
    console.log(error.message);
  }
}

const chartData = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$date" } },
          totalSales: { $sum: "$total" },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(salesData);
  } catch (error) {
    console.log(error);
  }
};

const adminReports = async (req, res) => {
  try {
    //   const orderData = await Order.find().lean()

    // const productData = await product.find({},{Name:1,Category:1,_id:0,Price:1}).lean()

    // productData.forEach((val)=>{
    //   val.count = 0;
    //   val.sum = 0;
    // })

    // productData.forEach((element)=>{

    //   orderData.forEach((val)=>{
    //     val.product.forEach((pro)=>{
    //       if(pro.name == element.Name){
    //         element.count += pro.quantity
    //         element.sum = element.Price * element.count
    //       }
    //     })
    //   })
    // })

    // console.log(productData);

    const productData2 = await product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "Category",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);

    const orderData = await Order.aggregate([
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.name",
          count: { $sum: "$product.quantity" },
        },
      },
    ]);

    const productData = await product.aggregate([
      {
        $project: {
          Name: 1,
          Category: 1,
          Price: 1,
          count: { $literal: 0 },
          sum: { $literal: 0 },
        },
      },
    ]);

    productData2.forEach((element) => {
      const orderItem = orderData.find((item) => item._id === element.Name);
      if (orderItem) {
        element.count = orderItem.count;
        element.sum = element.Price * element.count;
      }
    });

    console.log(productData, "4rtwat");

    res.render("reports", { admin: true, productData, productData2 });

    //  res.render('reports',{admin:true, productData})
  } catch (error) {
    console.log(error.message);
  }
};


const filterSales = async(req,res)=>{
  try {
    const start = req.body.startDate
    const end = req.body.endDate

    console.log(start, "gs ", end);
  } catch (error) {
    console.log(error.message);
  }
}

// j filter
let filter= false;

const reports = async (req, res) => {
  try {

      const orderdata = await Order.aggregate([
          { $match: { status: "Delivered" } },
          {
              $group: {
                  _id: null,
                  totalSales: { $sum: "$total" }

              },

          },
          {
              $sort: { _id: 1 }
          }
      ]);
      const totalSales = orderdata.length > 0 ? orderdata[0].totalSales : 0;


      if (!filter) {
          orderdataFilter = await Order.find({ status: "Delivered" })
      }
     
      console.log(orderdataFilter);

      //  orderdataFilter.forEach(order => {
      //      order.deliveryDateFormatted = moment(order.delivery_date).format('DD-MM-YYYY');
      //  });

      res.render('reports', { admin: 1, orderdata: orderdataFilter, totalSales: totalSales });

  } catch (error) {
      console.log(error.message);
  }
}


const filteringOrder = async (req, res) => {
  try {
      const reqDate = req.body.startDate
      const toDate = req.body.endDate 


      orderdataFilter = await Order.find(

          {
              $and: [
                  {
                      date: {
                          $gt: reqDate,
                      }
                  },
                  {
                      date: {
                          $lt: toDate,
                      }
                  }]
          });


      
      console.log(reqDate, toDate, "tdate");
      
      filter = true;
      res.redirect('/admin/reports');
  } catch (error) {
      console.log(error.message);
  }
}

// j filter

module.exports = {
  adminLogin,
  adminRegistration,
  newAdmin,
  adminDashboard,
  verifyAdmin,
  loadProducts,
  loadUsers,
  addProduct,
  insertproduct,
  deleteProduct,
  editProduct,
  updateProduct,
  blockUser,
  UnblockUser,
  adminLogout,
  loadCategory,
  insertCategory,
  editCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  loadOrders,
  orderStatus,
  OrderProducts,
  loadCoupons,
  addCoupon,
  insertCoupon,
  deleteCoupon,
  chartData,
  adminReports,
  viewfullproducts,
  filterSales,
  reports,
  filteringOrder
};
