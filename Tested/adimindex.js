
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const randomstring = require('randomstring');


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
//login
let otpCache = {};
app.post('/api/loginNumber', (req, res) => { 
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
const otp = generateOTP();
  otpCache[phoneNumber] = otp; 
 console.log(`Generated OTP for ${phoneNumber}: ${otp}`);
 res.json({ message: 'OTP generated successfully' });
});

//verifynum
app.post('/api/verify-otp', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otpAttempt = req.body.otp;
if (!phoneNumber || !otpAttempt) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }
const cachedOTP = otpCache[phoneNumber];
if (!cachedOTP) {
    return res.status(404).json({ error: 'OTP not found or expired' });
  }
 if (otpAttempt === cachedOTP) {
    delete otpCache[phoneNumber];
    res.json({ message: 'OTP verified successfully' });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});

//register
let users = [];
app.post('/api/register', (req, res) => {
  const { username, email, mobileNo, password } = req.body;
users.push({ username, email, mobileNo, password });

  res.json({ message: 'User successfully registered' });
});

// start banners section
 let banners =[
    {
        id:1,
        images:"https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg"
    },
    {
        id:2,
        images:"https://cdn.pixabay.com/photo/2016/10/22/01/14/web-banners-1759546_640.png"
    },
    {
        id:3,
        images:"https://cdn.pixabay.com/photo/2017/03/25/17/55/colorful-2174045_640.png"
    }
    , {
        id:4,
        images:"https://cdn.pixabay.com/photo/2016/05/27/08/51/mobile-phone-1419275_640.jpg"
    }
 ]
//all
 app.get('/api/banners', (req, res) => {
    res.json(banners);
  }); 

//add
  app.post('/api/addbanner', (req, res) => {
    const {id,images}= req.body
    const obj = {
        id:id,
        images:images
    }
    banners.push(obj)
    res.json(banners);
  }); 

//update
app.put('/api/updatebanner/:id' , (req, res)=>{
  const id = parseInt(req.params.id);
  const {images}= req.body;
  const index = banners.findIndex(banner => banner.id === id);
  if (index !== -1){
    banners[index].images = images;
    res.json({ message: `Images of banner with id ${id} updated successfully`, banner: banners[index] });
  }else{
    res.status(404).json({error:`Banner with id ${id} not found.`})
  }
}) 
// Delete end banner
app.delete('/api/deletebanner/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = banners.findIndex(banner => banner.id === id);

  if (index !== -1) {
    banners.splice(index, 1);
    res.json({ message: `Banner with id ${id} deleted successfully` });
  } else {
    res.status(404).json({ error: `Banner with id ${id} not found.` });
  }
});
// start Products section
let products =[
  {
      id:1,
      name:"products",
      images:"https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_1280.jpg",
      price: 19.99 ,
     description: 'Description of Product 1'
  },
  {
      id:2,
      name:"product1",
      images:"https://cdn.pixabay.com/photo/2016/10/22/01/14/web-banners-1759546_640.png",
      price: 29.99 ,
     description: 'Description of Product 2'
  },
  {
      id:3,
      name:"product2",
      images:"https://cdn.pixabay.com/photo/2017/03/25/17/55/colorful-2174045_640.png",
      price: 59.99 ,
      description: 'Description of Product 3'
  }
  , {
      id:4,
      name:"product3",
      images:"https://cdn.pixabay.com/photo/2016/05/27/08/51/mobile-phone-1419275_640.jpg",
      price: 123.99 ,
      description: 'Description of Product 4'
  },
]
//all 
app.get('/api/products', (req, res) => {
  res.json(products);
}); 
//details
app.get('/api/product-details/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(product => product.id === id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });
//update 
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const product = products.find(p => p.id === parseInt(id));
  if (!product) {
      return res.status(404).json({ error: 'Product not found' });
  }
  product.name = name;
  product.price = parseFloat(price);
  res.json({ message: 'Product updated successfully', product });
});

// Delete end product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(product => product.id === parseInt(id)); 
  if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
  }
  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});
//profile
let profiles = [];
app.get('/api/profiles', (req, res) => {
  res.json(profiles);
});
app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find(profile => profile.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  res.json(profile);
});

app.post('/api/profiles', (req, res) => {
  const { name, email, bio } = req.body;

  if (!name || !email || !bio) {
    return res.status(400).json({ message: 'Please provide name, email, and bio' });
  }
  const newProfile = {
    id: uuidv4(),
    name,
    email,
    bio
  };

  profiles.push(newProfile);
  res.status(201).json({ message: 'Profile created', profile: newProfile });
});

app.put('/api/profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const { name, email, bio } = req.body;

  const profileIndex = profiles.findIndex(profile => profile.id === profileId);
  if (profileIndex === -1) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  profiles[profileIndex] = {
    id: profileId,
    name: name || profiles[profileIndex].name,
    email: email || profiles[profileIndex].email,
    bio: bio || profiles[profileIndex].bio
  };

  res.json({ message: 'Profile updated', profile: profiles[profileIndex] });
});
// Delete a profile
app.delete('/api/profiles/:id', (req, res) => {
    const profileId = req.params.id;
  
    profiles = profiles.filter(profile => profile.id !== profileId);
  
    res.json({ message: 'Profile deleted' });
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
