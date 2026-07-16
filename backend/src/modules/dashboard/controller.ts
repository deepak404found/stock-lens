import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { dashboardService } from "./service.js";

export class DashboardController {
  get = async (_req: Request, res: Response) => {
    const data = await dashboardService.getDashboard();
    return sendSuccess(res, data, "Success");
  };
}

export const dashboardController = new DashboardController();
