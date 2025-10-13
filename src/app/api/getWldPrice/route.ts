import axios from "axios";

export async function GET() {
  const prod = process.env.COINMARKETCAP_PROD_URL;
  const dev = process.env.COINMARKETCAP_DEV_URL;
  const url = dev;
  try {
    const response = await axios.get(`${url}/v2/tools/price-conversion`, {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      },
      params: {
        symbol: "WLD",
        convert: "IDR",
        amount: 1,
      },
    });

    const price = response.data.data.WLD.quote.IDR.price;

    return new Response(JSON.stringify({ price }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching price:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch price" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
