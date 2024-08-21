
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const { v4: uuidv4 } = require('uuid');
const randomstring = require('randomstring');

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Add your database password
  database: 'user'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + db.threadId);
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


function generateOTP() {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// POST endpoint to generate and store OTP in database
app.post('/api/loginNumber', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const otp = generateOTP();
  const sqlInsert = 'INSERT INTO login (phoneNumber, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp)';
  db.query(sqlInsert, [phoneNumber, otp], (err, result) => {
    if (err) {
      console.error('Error generating OTP and storing in database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    res.json({ message: 'OTP generated successfully' });
  });
});

app.post('/api/verify-otp', (req, res) => {
  const { phoneNumber, otpAttempt } = req.body;
  if (!phoneNumber || !otpAttempt) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const sqlSelect = 'SELECT otp FROM otp_cache WHERE phoneNumber = ?';
  db.query(sqlSelect, [phoneNumber], (err, results) => {
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
      db.query(sqlDelete, [phoneNumber], (err, result) => {
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

app.get('/api/banners', (req, res) => {
  db.query('SELECT * FROM allbanner', (err, banners) => {
    if (err) {
      console.error('Error querying banners: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(banners);
  });
});


app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error('Error querying products: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

app.get('/api/product-details/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [productId], (err, results) => {
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

app.get('/api/cart', (req, res) => {
  db.query('SELECT * FROM cart', (err, cart) => {
    if (err) {
      console.error('Error querying cart: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(cart);
  });
});

app.post('/api/add-cart', (req, res) => {
  const { productId, productName,image, quantity, price } = req.body; 
  if (!productId || !productName ||!image ||!quantity || !price) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  const sql = 'INSERT INTO cart (productId, productName, image, quantity, price) VALUES (?, ?, ?, ? ,?)';
  db.query(sql, [productId, productName,image, quantity, price], (err, result) => {
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



// GET all profiles
app.get('/api/profiles', (req, res) => {
  const sql = 'SELECT * FROM profiles';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching profiles from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET profile by ID
app.get('/api/profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const sql = 'SELECT * FROM profiles WHERE id = ?';
  db.query(sql, [profileId], (err, results) => {
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

// POST create new profile
app.post('/api/add-profiles', (req, res) => {
  const { name, email, bio } = req.body;
  if (!name || !email || !bio) {
    return res.status(400).json({ message: 'Please provide name, email, and bio' });
  }

  const id = uuidv4();
  const sql = 'INSERT INTO profiles (id, name, email, bio) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, name, email, bio], (err, result) => {
    if (err) {
      console.error('Error adding profile to database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    const newProfile = { id, name, email, bio };
    res.status(201).json({ message: 'Profile created', profile: newProfile });
  });
});

app.put('/api/update-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const { name, email, bio } = req.body;

  const sql = 'UPDATE profiles SET name = ?, email = ?, bio = ? WHERE id = ?';
  db.query(sql, [name, email, bio, profileId], (err, result) => {
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

app.delete('/api/delete-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const sql = 'DELETE FROM profiles WHERE id = ?';
  db.query(sql, [profileId], (err, result) => {
    if (err) {
      console.error('Error deleting profile from database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted' });
  });
});

app.get('/api/Address', (req, res) => {
  const sql = 'SELECT * FROM addresses';
  db.query(sql , (err ,results)=>{
    if(err){
      console.error('Error fetching profiles from database: ' + err.stack)
      return res.status(500).json({error :"Database error"})
    }
    res.json(results); 
  });
});

app.post('/api/addAddress', (req, res) => {
  const { id, name, email, mobileNo, Address, Pincode } = req.body;
  const sql = 'INSERT INTO addresses (id, name, email, mobileNo, Address, Pincode) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [id, name, email, mobileNo, Address, Pincode];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting address into database: ' + err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Address added to database with ID: ' + result.insertId);
    res.status(200).json({ message: 'Address added successfully' });
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

