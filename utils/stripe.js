const stripeKey =
  process.env.NODE_ENV === "development"
    ? require("../config/database").stripeKey
    : process.env.STRIPE_KEY;
const stripe = require("stripe")(stripeKey);

exports.stripeCharges = async (req, totalInCents) => {
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  console.log({ token });

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
