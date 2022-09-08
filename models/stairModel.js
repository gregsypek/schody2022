const mongoose = require('mongoose');
const slugify = require('slugify');

const stairSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Schody muszą mieć nazwę'],
    unique: true,
  },
  slug: String,
  imageCover: {
    type: String,
    required: [true, 'Schody muszą mieć zdjęcie poglądowe'],
  },
  description: {
    type: String,
    required: [true, 'Schody muszą mieć opis!'],
  },
  images: [String],
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
stairSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Stair = mongoose.model('Stair', stairSchema);

module.exports = Stair;
