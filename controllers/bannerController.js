const banner = require("../models/bannerModel");

const message = require("../Helpers/Messages");

const loadBanner = async (req, res) => {
  try {
    const bannerData = await banner.find({}).lean();
    res.render("Banner", { bannerData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    res.render("addBanner", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const insertBanner = async (req, res) => {
  try {
    const Banner = new banner({
      Badge: req.file.filename,
      Name: req.body.Name,
    });

    const BannerData = await Banner.save();

    if (BannerData) {
      res.redirect("/admin/banner");
    } else {
      res.render("addBanner", { message: message.BannerFailed, admin: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const bannerData = await banner.find({ _id: id });
    console.log(bannerData,'id query');
    res.render("editBanner", {bannerData});
  } catch (error) {
    console.log(error.message);
  }
};

const updateBanner = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id, "id logged");
    if (req.file) {
      console.log(1);
      const bannerData = await banner.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            Badge: req.file.filename,
            Name: req.body.Name
          },
        }
      );
      console.log(bannerData);
      res.redirect("/admin/banner");
    } else {
      console.log(2);
      const bannerData = await banner.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            Name: req.body.Name,
          },
        }
      );
      console.log(bannerData);
      res.redirect("/admin/banner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async(req,res)=>{
  try {
    const id = req.query.id;
    const bannerData = await banner.deleteOne({ _id: id });
    res.redirect('/admin/banner')
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadBanner,
  addBanner,
  insertBanner,
  editBanner,
  updateBanner,
  deleteBanner
};
