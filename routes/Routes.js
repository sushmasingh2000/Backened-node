const express = require("express");
const {login, verifyotp, banner, product, product_details, cart, Addcart, Profiles, Addprofile }
= require("../controller");
const router = express.Router();

router.post("/api/loginNumber",login);
router.post('/api/verify-otp', verifyotp)
router.get('/api/banners', banner)
router.get('/api/products', product)
router.get('/api/product-details/:id',product_details)
router.get('/api/cart', cart)
router.post('/api/add-cart', Addcart)
router.get('/api/profiles',Profiles)
// router.post('/api/add-profiles', Addprofile)




module.exports = router;