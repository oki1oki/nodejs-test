import express from "express"
import dotenv from "dotenv"
import ticketRoutes from "./ticket/ticket.routes"
import { setupSwagger } from "./swagger"

dotenv.config()

const app = express()
const PORT = process.env.APP_PORT || 3000

app.use(express.json())

setupSwagger(app)

app.use("/api/tickets", ticketRoutes)

app.get("/", (req, res) => {
	res.send("Спасибо за тестовое")
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
