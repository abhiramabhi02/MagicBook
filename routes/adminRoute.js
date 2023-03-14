const express = require("express");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const configs = require("../config/config");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/fileupload");
const session = require("express-session");
const admin_route = express();
const path = require("path");
const bannerController = require("../controllers/bannerController");

admin_route.set("views", "./views/admin");

//calling adminLogin
admin_route.get("/adminlogin", auth.isLogoutadmin, adminController.adminLogin);

//calling adminRegistration
admin_route.get(
  "/adminregister",
  auth.isLogoutadmin,
  adminController.adminRegistration
);

//registering new admin
admin_route.post("/adminregister", adminController.newAdmin);

//load Dashboard
admin_route.get("/admin", auth.isLoginadmin, adminController.adminDashboard);

//verify admin
admin_route.post("/adminlogin", adminController.verifyAdmin);

//load product management
admin_route.get("/products", auth.isLoginadmin, adminController.loadProducts);

admin_route.get(
  "/viewfullproducts",
  auth.isLoginadmin,
  adminController.viewfullproducts
);

//load user Management
admin_route.get("/users", auth.isLoginadmin, adminController.loadUsers);

//add new product page
admin_route.get("/addproduct", adminController.addProduct);

//add new product
admin_route.post(
  "/addproduct",
  upload.single("image"),
  adminController.insertproduct
);

//delete product
admin_route.get("/deleteproduct", adminController.deleteProduct);

//edit product page
admin_route.get("/editproduct", adminController.editProduct);

//edit product
admin_route.post(
  "/editproduct",
  upload.single("image"),
  adminController.updateProduct
);

//user Block
admin_route.get("/blockuser", adminController.blockUser);

//user Unblock
admin_route.get("/unblockuser", adminController.UnblockUser);

//load category
admin_route.get("/category", auth.isLoginadmin, adminController.loadCategory);

//add category page
admin_route.get("/addcategory", auth.isLoginadmin, adminController.addCategory);

//insert new category
admin_route.post("/addcategory", adminController.insertCategory);

//edit category page
admin_route.get(
  "/editcategory",
  auth.isLoginadmin,
  adminController.editCategory
);

//edit existing category
admin_route.post(
  "/editcategory",
  auth.isLoginadmin,
  adminController.updateCategory
);

//delete existing category
admin_route.get(
  "/deletecategory",
  auth.isLoginadmin,
  adminController.deleteCategory
);

//load orders page
admin_route.get("/orders", auth.isLoginadmin, adminController.loadOrders);

//load products in order
admin_route.get(
  "/viewproducts",
  auth.isLoginadmin,
  adminController.OrderProducts
);

//admin logout
admin_route.get("/adminlogout", adminController.adminLogout);

//order status for shipping order
admin_route.get("/shiporder", adminController.orderStatus);

//order status for deliver the order
admin_route.get("/deliverorder", adminController.orderStatus);

//load coupon page
admin_route.get("/coupons", auth.isLoginadmin, adminController.loadCoupons);

//load add coupon page
admin_route.get("/addcoupons", auth.isLoginadmin, adminController.addCoupon);

admin_route.post("/addcoupons", adminController.insertCoupon);

admin_route.get("/reports", auth.isLoginadmin, adminController.adminReports);

admin_route.get("/chartData", auth.isLoginadmin, adminController.chartData);

admin_route.get("/banner", auth.isLoginadmin, bannerController.loadBanner);

admin_route.get("/addBanner", auth.isLoginadmin, bannerController.addBanner);

admin_route.post(
  "/addBanner",
  upload.single("badge"),
  bannerController.insertBanner
);

admin_route.get("/editbanner", auth.isLoginadmin, bannerController.editBanner);

admin_route.post(
  "/editbanner",
  upload.single("badge"),
  bannerController.updateBanner
);

admin_route.post('/salesfilter',auth.isLoginadmin,adminController.filterSales)

module.exports = admin_route;
