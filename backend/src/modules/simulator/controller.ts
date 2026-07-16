import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/api-response.js";
import { simulatorService } from "./service.js";
import type { StartSimulatorInput } from "./validation.js";

export class SimulatorController {
  start = async (req: Request, res: Response) => {
    const status = await simulatorService.start(req.body as StartSimulatorInput);
    return sendSuccess(res, status, "Simulation started", 202);
  };

  stop = async (_req: Request, res: Response) => {
    const status = await simulatorService.stop();
    return sendSuccess(res, status, "Simulation stopped");
  };

  status = async (_req: Request, res: Response) => {
    return sendSuccess(res, simulatorService.getStatus(), "Success");
  };
}

export const simulatorController = new SimulatorController();
