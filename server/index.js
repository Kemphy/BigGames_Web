import express from "express"
import cors from "cors"
import midtransClient from "midtrans-client"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
})

app.post("/create-transaction", async (req, res) => {
  const { orderId, amount, itemName } = req.body

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: orderId,
          price: amount,
          quantity: 1,
          name: itemName,
        },
      ],
    })

    res.json({ token: transaction.token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () =>
  console.log("Payment server running on http://localhost:3001")
)
