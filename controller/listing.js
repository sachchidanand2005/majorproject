
// const Listing = require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  
// const mapToken = process.env.MAP_TOKEN;

// const geocodingClient = mbxGeocoding({ accessToken: mapToken });




// module.exports.index = async(req,res)=>{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", {allListings});
// };

// module.exports.renderNewForm = (req, res)=>{
//     res.render("listings/new.ejs");
// };

// module.exports.showListing = async(req, res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id)
//     .populate({
//         path: "reviews",
//         populate: {
//             path: "author",
//         },
//     })
//     .populate("owner");
//     if(!listing){
//         req.flash("error", "Listing you requested for does not exists");
//          return res.redirect("/listings");
//     }
//     console.log(listing);
//     res.render("listings/show.ejs", {listing});
// };

// module.exports.createListing = async (req, res, next) => {
//   const geoResponse = await geocodingClient
//     .forwardGeocode({
//       query: req.body.listing.location,
//       limit: 1,
//     })
//     .send();

//   console.log("Mapbox response:", geoResponse.body.features);

//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;

//   if (req.file) {
//     newListing.image = {
//       url: req.file.path,
//       filename: req.file.filename,
//     };
//   }

//   if (geoResponse.body.features && geoResponse.body.features.length > 0) {
//     newListing.geometry = geoResponse.body.features[0].geometry;
//   } else {
//     console.warn("⚠️ Mapbox returned no coordinates for:", req.body.listing.location);
//     newListing.geometry = {
//       type: "Point",
//       coordinates: [-74.006, 40.7128], // default to NYC
//     };
//   }

//   await newListing.save();
//   console.log(newListing);

//   req.flash("success", "New Listing Created");
//   res.redirect("/listings");
// };


// // module.exports.createListing = async (req, res, next)=>{
// //        let response = await geocodingClient.forwardGeocode({
// //        query: req.body.listing.location,
// //         limit: 1, 
// //        })
// //       .send();
// //        let url = req.file.path;
// //        let filename = req.file.filename;
// //        const newListing = new Listing(req.body.listing);
// //        newListing.owner = req.user._id;
// //        newListing.image = { url, filename };

// //        newListing.geometry = response.body.features[0].geometry;
       
// //        let savedListing = await newListing.save();
// //        console.log(savedListing);
// //        req.flash("success", "New Listing Created");
// //        res.redirect("/listings");
// // };

// module.exports.renderEditForm = async(req,res)=>{
//      let {id} = req.params;
//     const listing = await Listing.findById(id);
//      if(!listing){
//         req.flash("error", "Listing you requested for does not exists");
//          return res.redirect("/listings");
//     }
//     let originalImageUrl = listing.image.url;
//     originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
//     res.render("listings/edit.ejs", { listing, originalImageUrl});
// };

// module.exports.updateListing = async(req, res)=>{
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

//     if(typeof req.file !== "undefined"){
//          let url = req.file.path;
//        let filename = req.file.filename;
//        listing.image = { url, filename };
//        await listing.save();
//     }
//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

// module.exports.destroyListing = async(req, res)=>{
//     let {id} = req.params;
//     let deletedListing= await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     req.flash("success", "Listing Deleted");
//     res.redirect("/listings");
// };




const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudConfig');

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// Helper to get geometry
const getGeometry = async (location, country) => {
    const query = `${location}, ${country || ''}`.replace(/^"+|"+$/g, '').trim();
    try {
        const response = await geocodingClient.forwardGeocode({ query, limit: 1 }).send();
        if (response.body.features.length > 0) {
            return response.body.features[0].geometry;
        }
    } catch (err) {
        console.error(`Geocoding error for "${query}":`, err.message);
    }
    return { type: 'Point', coordinates: [-74.006, 40.7128] }; // default NYC
};

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
};

module.exports.createListing = async (req, res) => {
    const { listing } = req.body;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    newListing.geometry = await getGeometry(listing.location, listing.country);

    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
};

module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('owner');
    if (!listing) {
        req.flash('error', 'Listing does not exist');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
};

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash('error', 'Listing does not exist');
        return res.redirect('/listings');
    }

    const originalImageUrl = listing.image?.url || '';
    res.render('listings/edit.ejs', { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    // Update geometry if location changed
    if (req.body.listing.location || req.body.listing.country) {
        listing.geometry = await getGeometry(req.body.listing.location, req.body.listing.country);
        await listing.save();
    }

    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash('success', 'Listing Deleted');
    res.redirect('/listings');
};
