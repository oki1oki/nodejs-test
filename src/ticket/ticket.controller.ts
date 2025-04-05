import { Request, Response } from "express"
import { TicketService } from "./ticket.service"

const ticketService = new TicketService()

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Создать новый тикет
 *     description: Создает новый тикет с указанным заголовком и содержанием
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Заголовок тикета
 *               content:
 *                 type: string
 *                 description: Содержание тикета
 *     responses:
 *       201:
 *         description: Тикет успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Неверный запрос
 */
const createTicket = async (req: Request, res: Response) => {
	try {
		const { title, content } = req.body

		if (!title || !content) {
			return res.status(400).json({
				status: "error",
				message: "Необходимо указать title и content"
			})
		}

		const ticket = await ticketService.create(title, content)
		res.status(201).json({
			status: "success",
			data: ticket
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Получить список тикетов
 *     description: Возвращает список всех тикетов с возможностью фильтрации
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Количество тикетов на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *         description: Смещение для пагинации
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Фильтр по дате
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата для фильтрации
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата для фильтрации
 *     responses:
 *       200:
 *         description: Список тикетов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 */
const getTickets = async (req: Request, res: Response) => {
	try {
		const { limit, offset, date, startDate, endDate } = req.query

		if (date && (startDate || endDate)) {
			return res.status(400).json({
				status: "error",
				message: "Нельзя использовать date вместе с startDate или endDate"
			})
		}

		const tickets = await ticketService.findAll({
			limit: limit ? Number(limit) : 10,
			offset: offset ? Number(offset) : 0,
			date: date ? new Date(date as string) : undefined,
			startDate: startDate ? new Date(startDate as string) : undefined,
			endDate: endDate ? new Date(endDate as string) : undefined
		})

		res.json({
			status: "success",
			data: tickets
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

/**
 * @swagger
 * /api/tickets/start/{id}:
 *   put:
 *     tags:
 *       - Tickets
 *     summary: Начать работу над тикетом
 *     description: Изменяет статус тикета на IN_PROGRESS
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID тикета
 *     responses:
 *       200:
 *         description: Статус тикета успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Тикет не найден
 */
const startTicket = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const ticket = await ticketService.start(id)
		res.json({
			status: "success",
			data: ticket
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

/**
 * @swagger
 * /api/tickets/complete/{id}:
 *   put:
 *     tags:
 *       - Tickets
 *     summary: Завершить тикет
 *     description: Изменяет статус тикета на COMPLETED
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID тикета
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Комментарий к завершению
 *     responses:
 *       200:
 *         description: Статус тикета успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Тикет не найден
 */
const completeTicket = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { comment } = req.body

		if (!comment) {
			return res.status(400).json({
				status: "error",
				message: "Необходимо указать comment"
			})
		}

		const ticket = await ticketService.complete(id, comment)
		res.json({
			status: "success",
			data: ticket
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

/**
 * @swagger
 * /api/tickets/cancel/{id}:
 *   put:
 *     tags:
 *       - Tickets
 *     summary: Отменить тикет
 *     description: Изменяет статус тикета на CANCELLED
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID тикета
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Комментарий к отмене
 *     responses:
 *       200:
 *         description: Статус тикета успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Тикет не найден
 */
const cancelTicket = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { comment } = req.body

		if (!comment) {
			return res.status(400).json({
				status: "error",
				message: "Необходимо указать comment"
			})
		}

		const ticket = await ticketService.cancel(id, comment)
		res.json({
			status: "success",
			data: ticket
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

/**
 * @swagger
 * /api/tickets/cancel-all:
 *   put:
 *     tags:
 *       - Tickets
 *     summary: Отменить все тикеты в работе
 *     description: Отменяет все тикеты со статусом IN_PROGRESS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Комментарий к отмене
 *     responses:
 *       200:
 *         description: Тикеты успешно отменены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешной отмене
 */
const cancelAllTickets = async (req: Request, res: Response) => {
	try {
		const { comment } = req.body

		if (!comment) {
			return res.status(400).json({
				status: "error",
				message: "Необходимо указать comment"
			})
		}

		const ticketsCount = await ticketService.cancelAllInProgress(comment)
		res.json({
			status: "success",
			message: `Отменено тикетов - ${ticketsCount} шт.`
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: (error as Error).message
		})
	}
}

export {
	createTicket,
	getTickets,
	startTicket,
	completeTicket,
	cancelTicket,
	cancelAllTickets
}
