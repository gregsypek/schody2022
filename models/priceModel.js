const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Podaj nazwę wycenianej usługi'],
  },
  imageCover: {
    type: String,
    required: [true, 'Schody muszą mieć zdjęcie poglądowe'],
  },

  price: {
    type: Number,
    required: [true, 'Podaj cenę za usługę'],
  },
  priceIncluded: {
    type: [String],
    default: [String],
    required: [true, 'Podaj co obejmuje cena'],
  },
  additionals: {
    type: [String],
  },
});

// priceSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'stairs',
//     select: 'photo',
//   });
//   next();
// });

const Price = mongoose.model('Price', priceSchema);

module.exports = Price;
