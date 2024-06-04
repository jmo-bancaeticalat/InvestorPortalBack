const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre("save", async function(next){
  const user=this;

  if(!user.isModified("password")) return next();

  try{
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
    next();
  }catch(error){
    console.log(error);
    throw new Error("Falló el hash de contraseña");
  }
});

userSchema.methods.comparePassword = async function(candidatePassword){
  return await bcryptjs.compare(candidatePassword, this.password);
}

const User = model('User', userSchema);

module.exports = { User };
