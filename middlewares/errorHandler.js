const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.render("users/404s",{noh:true});
  };
  
  module.exports = { notFound,errorHandler};