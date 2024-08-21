const { failMsg } = require("../helper/helperResponse");
const { queryDb } = require("../helper/adminHelper");


function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;0
  }

  exports.login = async (req, res) => {
    const { phoneNumber } = req.body;
      if (!phoneNumber) {
      return res.status(400).json({ msg: 'Phone number is required' });
    }
    try {
        const otp = generateOTP();
        const query = 'INSERT INTO login (phoneNumber, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp)';
        await queryDb(query, [phoneNumber, otp])
        .then((result) => {
            return res.status(200).json({
              msg: "OTP generated successfully",
              data: result,
            });
          })
          .catch((e) => {
            console.log(e);
            return res.status(500).json({
              msg: `Something went wrong api calling`,
            });
          });
      } catch (e) {
        return failMsg("Something went worng in node api");
      }
    };
  
  exports.verifyotp = async (req, res) => {
    const { phoneNumber, otpAttempt } = req.body;
    if (!phoneNumber || !otpAttempt) {
      return res.status(400).json({ error: 'Phone Number and OTP are required' });
    }  
    try {
      const query = 'SELECT otp FROM login WHERE phoneNumber = ?';
      const results = await queryDb(query, [phoneNumber]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'OTP not found or expired' });
      }
      const cachedOTP = results[0].otp;
      if (otpAttempt === cachedOTP) {
        return res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP: ', error);
      return res.status(500).json({ error: 'Database error' });
    }
  };
  
  exports.banner = async (req, res) => {
      try {
        const sqlSelect = 'SELECT * FROM allbanner';
        const banners = await queryDb(sqlSelect);
        res.json({
          msg:"All sucessfully fetched",banners
        });
      } 
      catch (error) {
        console.error('Error querying banners: ', error.stack);
        res.status(500).json({ error: 'Database error' });
      }
    };
    exports.product = async (req, res) => {
      try {
        const sqlSelect = 'SELECT * FROM products';
        const products = await queryDb(sqlSelect);
        res.json({
          msg:"All sucessfully fetched",products
        });
      } 
      catch (error) {
        console.error('Error querying banners: ', error.stack);
        res.status(500).json({ error: 'Database error' });
      }
    };

    exports.product_details = async (req, res) => {
      try {
        const {productId} = await queryDb(query);
        const query = 'SELECT * FROM products WHERE id = ?';
        res.json(productId);
      } 
      catch (error) {
        console.error('Error querying banners: ', error.stack);
        res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      
    };
  
    exports.cart = async (req, res) => {
      try {
        const query = 'SELECT * FROM cart';
        const cart = await queryDb(query);
        res.json({
          msg:"All sucessfully fetched",cart});
      } 
      catch (error) {
        console.error('Error querying banners: ', error.stack);
        res.status(500).json({ error: 'Database error' });
      }
    };

    exports.Addcart = async (req, res) => {
      const { productId, productName, image, quantity, price } = req.body;
      if (!productId || !productName || !image || !quantity || !price) {
        return res.status(400).json({ error: 'Please provide all required fields' });
      }
      const sql = 'INSERT INTO cart (productId, productName, image, quantity, price) VALUES (?, ?, ?, ?, ?)';
      try {
        const result = await queryDb(sql, [productId, productName, image, quantity, price]);
        const newItem = {
          id: result.insertId,
          productId,
          productName,
          image,
          quantity,
          price,
        };
        return res.status(201).json({ message: 'Added to cart successfully', cartItem: newItem });
      } 
      catch (error) {
        console.error('Error adding item to cart: ', error);
        return res.status(500).json({ error: 'Database error' });
      }
    };

    exports.Profiles = async (req, res) => {
      try {
        const query = 'SELECT * FROM profiles';
        const profile = await queryDb(query);
        res.json({
          msg:"All sucessfully fetched",profile});
      } 
      catch (error) {
        console.error('Error querying profile: ', error.stack);
        res.status(500).json({ error: 'Database error' });
      }
    };
    // exports.Addprofile = async (req, res) => {
    //   const { name, email, bio } = req.body;
    //   if (!name || !email || !bio) {
    //     return res.status(400).json({ error: 'Please provide name, email, and bio' });
    //   }
    //   const sql = 'INSERT INTO profiles (name, email, bio) VALUES (?, ?, ?)';
    //   try {
    //     const result = await queryDb(sql, [name, email, bio]);
    //     const newProfileId = result.insertId;
    //     const newProfile = { id: newProfileId, name, email, bio };
    
    //     return res.status(201).json({ message: 'Profile created', profile: newProfile });
    //   } 
    //    catch (error) {
    //     console.error('Error adding profile to database: ', error);
    //     return res.status(500).json({ error: 'Database error' });
    //   }
    // };
    
    


    