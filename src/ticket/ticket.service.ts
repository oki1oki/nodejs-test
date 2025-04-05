import { prisma as db } from "../prisma/prisma.service"
import { TicketStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"

export class TicketService {
	async findAll({
		limit = 10,
		offset = 0,
		date,
		startDate,
		endDate,
		status
	}: {
		limit: number
		offset: number
		date?: Date
		startDate?: Date
		endDate?: Date
		status?: TicketStatus
	}) {
		const whereClaus: Prisma.TicketWhereInput = {}

		if (date) {
			whereClaus.createdAt = {
				gte: new Date(date),
				lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
			}
		} else if (startDate || endDate) {
			whereClaus.createdAt = {}
			if (startDate) whereClaus.createdAt.gte = new Date(startDate)
			if (endDate)
				whereClaus.createdAt.lt = new Date(
					new Date(endDate).setDate(new Date(endDate).getDate() + 1)
				)
		}

		return db.ticket.findMany({
			where: {
				...whereClaus,
				status
			},
			orderBy: {
				createdAt: "desc"
			},
			skip: offset,
			take: limit
		})
	}

	async create(title: string, content: string) {
		return db.ticket.create({
			data: {
				title,
				content
			}
		})
	}

	async start(id: string) {
		const existingTicket = await db.ticket.findUnique({
			where: { id }
		})

		if (!existingTicket) {
			throw new Error("Тикет не найден")
		}

		if (existingTicket.status !== TicketStatus.NEW) {
			throw new Error("Тикет не может быть начат, если он не в статусе NEW")
		}

		return db.ticket.update({
			where: { id },
			data: { status: TicketStatus.IN_PROGRESS }
		})
	}

	async complete(id: string, comment: string) {
		const existingTicket = await db.ticket.findUnique({
			where: { id }
		})

		if (!existingTicket) {
			throw new Error("Тикет не найден")
		}

		if (existingTicket.status !== TicketStatus.IN_PROGRESS) {
			throw new Error(
				"Тикет не может быть завершен, если он не в статусе IN_PROGRESS"
			)
		}

		return db.ticket.update({
			where: { id },
			data: {
				status: TicketStatus.COMPLETED,
				comment
			}
		})
	}

	async cancel(id: string, comment: string) {
		const existingTicket = await db.ticket.findUnique({
			where: { id }
		})

		if (!existingTicket) {
			throw new Error("Тикет не найден")
		}

		return db.ticket.update({
			where: { id },
			data: {
				status: TicketStatus.CANCELLED,
				comment
			}
		})
	}

	async cancelAllInProgress(comment: string) {
		const activeTicketsCount = await db.ticket.count({
			where: { status: TicketStatus.IN_PROGRESS }
		})

		if (activeTicketsCount === 0) {
			throw new Error("Активных тикетов нет")
		}

		await db.ticket.updateMany({
			where: { status: TicketStatus.IN_PROGRESS },
			data: {
				status: TicketStatus.CANCELLED,
				comment
			}
		})

		return activeTicketsCount
	}
}
