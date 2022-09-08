const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stair = require('../models/stairModel');
const Price = require('../models/priceModel');
const User = require('../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Polączenie z DB zakończone sukcesem');
  });

//READ JSON FILE

const stairs = JSON.parse(fs.readFileSync(`${__dirname}/stairs.json`, 'utf-8'));
const price = JSON.parse(fs.readFileSync(`${__dirname}/price.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Stair.create(stairs);
    await Price.create(price);
    await User.create(user, { validateBeforeSave: false });
    console.log('Dane załodowane!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Stair.deleteMany();
    await Price.deleteMany();
    await User.deleteMany();
    console.log('Dane usunięte!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
