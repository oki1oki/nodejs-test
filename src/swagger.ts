import { Express } from "express"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"

export const setupSwagger = (app: Express) => {
	const options = {
		definition: {
			openapi: "3.0.0",
			info: {
				title: "Ticket Management API",
				version: "1.0.0",
				description: "API для управления обращениями"
			},
			tags: [
				{
					name: "Tickets",
					description: "Управление тикетами"
				}
			],
			components: {
				schemas: {
					Ticket: {
						type: "object",
						required: ["title", "content"],
						properties: {
							id: {
								type: "string",
								description: "ID тикета"
							},
							title: {
								type: "string",
								description: "Заголовок тикета"
							},
							content: {
								type: "string",
								description: "Содержание тикета"
							},
							comment: {
								type: "string",
								description: "Комментарий к тикету"
							},
							status: {
								type: "string",
								enum: ["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
								description: "Статус тикета"
							},
							createdAt: {
								type: "string",
								format: "date-time",
								description: "Дата и время создания"
							},
							updatedAt: {
								type: "string",
								format: "date-time",
								description: "Дата и время последнего обновления"
							}
						}
					}
				}
			}
		},
		apis: [path.join(__dirname, "ticket", "*.ts")]
	}

	const swaggerSpec = swaggerJsdoc(options)
	app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
