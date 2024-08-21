const express = require('express');
const router = express.Router();
const pool = require('../Config/db');

function generateOTP() {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// POST endpoint to generate and store OTP in database
router.post('/loginNumber', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = generateOTP();
  const sqlInsert = 'INSERT INTO login (phoneNumber, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp)';
  pool.query(sqlInsert, [phoneNumber, otp], (err, result) => {
    if (err) {
      console.error('Error generating OTP and storing in database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    res.json({ message: 'OTP generated successfully' });
  });
});

router.post('/verify-otp', (req, res) => {
  const { phoneNumber, otpAttempt } = req.body;
  if (!phoneNumber || !otpAttempt) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const sqlSelect = 'SELECT otp FROM login WHERE phoneNumber = ?';
  pool.query(sqlSelect, [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error querying OTP from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'OTP not found or expired' });
    }

    const cachedOTP = results[0].otp;
    if (otpAttempt === cachedOTP) {
      const sqlDelete = 'DELETE FROM login WHERE phoneNumber = ?';
      pool.query(sqlDelete, [phoneNumber], (err, result) => {
        if (err) {
          console.error('Error deleting OTP from database: ' + err.stack);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'OTP verified successfully' });
      });
    } else {
      res.status(401).json({ error: 'Invalid OTP' });
    }
  });
});

router.get('/banners', (req, res) => {
  pool.query('SELECT * FROM allbanner', (err, banners) => {
    if (err) {
      console.error('Error querying banners: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(banners);
  });
});

router.get('/products', (req, res) => {
  pool.query('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error('Error querying products: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

router.get('/product-details/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE id = ?';
  pool.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error querying product details: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(results[0]);
  });
});

router.get('/cart', (req, res) => {
  pool.query('SELECT * FROM cart', (err, cart) => {
    if (err) {
      console.error('Error querying cart: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(cart);
  });
});

router.post('/add-cart', (req, res) => {
  const { productId, productName, image, quantity, price } = req.body;
  if (!productId || !productName || !image || !quantity || !price) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  const sql = 'INSERT INTO cart (productId, productName, image, quantity, price) VALUES (?, ?, ?, ?, ?)';
  pool.query(sql, [productId, productName, image, quantity, price], (err, result) => {
    if (err) {
      console.error('Error adding item to cart: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    const newItem = {
      id: result.insertId,
      productId,
      productName,
      image,
      quantity,
      price,
    };
    res.status(201).json({ message: 'Added to cart successfully', cartItem: newItem });
  });
});

router.get('/profiles', (req, res) => {
  pool.query('SELECT * FROM profiles', (err, results) => {
    if (err) {
      console.error('Error fetching profiles from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.get('/profiles/:id', (req, res) => {
  const profileId = req.params.id;
  pool.query('SELECT * FROM profiles WHERE id = ?', [profileId], (err, results) => {
    if (err) {
      console.error('Error fetching profile from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(results[0]);
  });
});

router.post('/add-profiles', (req, res) => {
  const { name, email, bio } = req.body;
  if (!name || !email || !bio) {
    return res.status(400).json({ message: 'Please provide name, email, and bio' });
  }

  const id = uuidv4();
  pool.query('INSERT INTO profiles (id, name, email, bio) VALUES (?, ?, ?, ?)', [id, name, email, bio], (err, result) => {
    if (err) {
      console.error('Error adding profile to database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    const newProfile = { id, name, email, bio };
    res.status(201).json({ message: 'Profile created', profile: newProfile });
  });
});

router.put('/update-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const { name, email, bio } = req.body;

  pool.query('UPDATE profiles SET name = ?, email = ?, bio = ? WHERE id = ?', [name, email, bio, profileId], (err, result) => {
    if (err) {
      console.error('Error updating profile in database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile updated', profile: { id: profileId, name, email, bio } });
  });
});

router.delete('/delete-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  pool.query('DELETE FROM profiles WHERE id = ?', [profileId], (err, result) => {
    if (err) {
      console.error('Error deleting profile from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  });
});

module.exports = router;
