import { Router } from "express"
import {
	cancelAllTickets,
	cancelTicket,
	completeTicket,
	createTicket,
	getTickets,
	startTicket
} from "./ticket.controller"

const router = Router()

router.post("/", createTicket)
router.get("/", getTickets)
router.put("/start/:id", startTicket)
router.put("/complete/:id", completeTicket)
router.put("/cancel/:id", cancelTicket)
router.put("/cancel-all", cancelAllTickets)

export default router
