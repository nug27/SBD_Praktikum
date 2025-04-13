const express = require('express');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


const corsOptions = {
  origin: "https://os.netlabdte.com", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
};

app.use(cors(corsOptions)); 

app.use(express.json());

app.use('/store', require('./src/routes/store.route'));
app.use('/user', require('./src/routes/user.route'));
app.use('/item', require('./src/routes/item.route')); 
app.use('/transaction', require('./src/routes/transaction.route')); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

cloudinary.config({
  cloud_name: 'dcbrepxqq',
  api_key: 558194156567597,
  api_secret: 'P3eHlUwy981g_BddBss_QNM9CYY',
  secure: true,
});