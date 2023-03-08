const express = require("express")
const app = express()
const session = require('express-session')
const hbs = require('express-handlebars')
const path = require("path")
const userRoute = require('./routes/userRoute')
const bodyParser = require('body-parser')
const configdb = require('./config/connectdb')
const adminRoute = require('./routes/adminRoute')
const Handlebars = require('handlebars')
const config = require('./config/config')

//connected mongodb here
configdb.connectdb

const { notFound, errorHandler } = require("./middlewares/errorHandler");

app.use(express.static(__dirname + '/public/'));

app.set("views",path.join(__dirname,'views'))
app.set('view engine','hbs')
app.engine('hbs',hbs.engine({
    extname:'hbs',
    defaultLayout:'layout',
    runtimeOptions: {
              allowProtoPropertiesByDefault:true,
              allowProtoMethodsByDefault: true,
            },        
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials'
}))

Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


Handlebars.registerHelper('paginate', function(array, options) {
    var perPage = options.hash.total || 10;
    var currentPage = options.data.page || 1;
    var totalPages = Math.ceil(array.length / perPage);
  
    var startPage, endPage;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 1 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
  
    var output = '';
    var context;
    for (var i = startPage; i <= endPage; i++) {
      context = {
        isActive: i == currentPage,
        label: i,
        page: i
      };
      output += options.fn(context);
    }
  
    if (endPage < totalPages) {
      output += options.fn({
        isDots: true,
        label: '...',
        page: null
      });
    }
  
    return output;
  });

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))


app.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:360000,
        sameSite:false,
    }
}))

//setting up of cache
app.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });



//calling userRoute here
app.use('/',userRoute)

//calling adminRoute here
app.use('/admin',adminRoute)

app.use("*", notFound);
app.use(errorHandler);

app.listen(3000, (req,res)=>{
    console.log("Server is running") 
})