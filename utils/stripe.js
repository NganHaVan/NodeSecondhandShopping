const stripeKey = require("../config/database").stripeKey;
const stripe = require("stripe")(stripeKey);

exports.stripeCharges = async (req, totalInCents) => {
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express

  //CHARGE THE CREDIT CARD
  const charge = await stripe.charges.create({
    amount: totalInCents,
    currency: "eu",
    description: "Purchasing products from HaVan's portfolio.",
    source: token
  });

  if (charge.status === "succeeded") {
    console.log({ charge });
    //IF STRIPE SUCCESSFULLY CHARGED THE CREDIT CARD
    return true;
  } else {
    return false;
  }
};
