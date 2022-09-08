const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Proszę podać imię'],
  },
  email: {
    type: String,
    required: [true, 'Proszę podać swój email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Proszę podać prawidłowy email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Proszę podać hasło'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Proszę potwierdzić hasło'],
    validate: {
      //THIS WORKD ONLY ON SAVE or CREATE!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Hasła nie są takie same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//////////////
userSchema.pre('save', async function (next) {
  //ONLY RUN THIS FUNCTION IF PASSWORD WAS MODIFIED
  if (!this.isModified('password')) return next();
  //HASH THE PASSWORD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);
  //DELETE PASSWORD CONFIRM
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//////////////
userSchema.pre(/^find/, function (next) {
  //this point to the current document
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
