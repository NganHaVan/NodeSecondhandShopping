const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartIndex = this.cart.items.findIndex(cart => {
    return cart.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItem = [...this.cart.items];
  if (cartIndex >= 0) {
    newQuantity = this.cart.items[cartIndex].quantity + 1;
    updatedCartItem[cartIndex].quantity = newQuantity;
  } else {
    updatedCartItem.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = { items: updatedCartItem };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeCart = function(productId) {
  const updatedCartItem = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  this.cart.items = updatedCartItem;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
