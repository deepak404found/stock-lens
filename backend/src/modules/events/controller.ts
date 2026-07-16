import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { eventsService } from "./service.js";
import type { CreateEventInput } from "./validation.js";

export class EventsController {
  create = async (req: Request, res: Response) => {
    const result = await eventsService.publish(req.body as CreateEventInput);
    return sendSuccess(res, result, "Event accepted", 202);
  };
}

export const eventsController = new EventsController();
