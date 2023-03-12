const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
    } else {
      return res.redirect("/login");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLoginadmin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
    } else {
      return res.redirect("/admin/adminlogin");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLogoutadmin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      return res.redirect("/admin/admin");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  isLoginadmin,
  isLogoutadmin,
};
