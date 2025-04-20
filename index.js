const express = require("express");
const cors = require("cors");
const axios = require("axios");
const products = require("./products.json");

const app = express();
app.use(cors());
const PORT = 3001;

async function getGoldPrice() {
  try {
    const response = await axios.get(
      "https://api.metalpriceapi.com/v1/latest",
      {
        params: {
          api_key: "0c5702013659b282ef9c005ae5a78149",
          base: "USD",
          currencies: "XAU",
        },
      }
    );

    const value = response.data.rates.XAU;
    const goldPriceInUSD = 1 / value;
    return goldPriceInUSD;
  } catch (error) {
    console.error(
      "Failed to fetch gold price, using fallback. Error:",
      error.message
    );
  }
}

app.get("/", (req, res) => {
  res.send("if you want to see products go to /products");
});

app.get("/products", async (req, res) => {
  try {
    const goldPrice = await getGoldPrice();

    const updatedProducts = products.map((product) => {
      const price = (
        (product.popularityScore + 1) *
        product.weight *
        goldPrice
      ).toFixed(2);

      return {
        ...product,
        price: parseFloat(price),
        popularityScoreOutOf5: (product.popularityScore * 5).toFixed(1),
      };
    });

    res.json(updatedProducts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({error: "Failed to fetch product data."});
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
