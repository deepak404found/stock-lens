"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { createInventorySocket } from "@/lib/socket";
import {
  getSimulatorStatus,
  startSimulator,
  stopSimulator,
  type SimulatorStatus,
  type StartSimulatorInput,
} from "@/services/simulator";

const idleStatus: SimulatorStatus = {
  status: "stopped",
  mode: "burst",
  published: 0,
  total: 0,
  startedAt: new Date(0).toISOString(),
};

export function useSimulator(enabled = true) {
  const [status, setStatus] = useState<SimulatorStatus>(idleStatus);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const isRunning = status.status === "running";

  useEffect(() => {
    if (!enabled) return;

    void getSimulatorStatus()
      .then(setStatus)
      .catch(() => {
        /* ignore — backend may be restarting */
      });

    const socket = createInventorySocket();
    socket.on("simulator.status", (payload) => {
      setStatus(payload);
    });

    return () => {
      socket.off("simulator.status");
      socket.disconnect();
    };
  }, [enabled]);

  const start = useCallback(async (input: StartSimulatorInput) => {
    setError(null);
    setIsStarting(true);
    try {
      const next = await startSimulator(input);
      setStatus(next);
      return next;
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to start simulation");
      setError(message);
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setError(null);
    setIsStopping(true);
    try {
      const next = await stopSimulator();
      setStatus(next);
      return next;
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to stop simulation");
      setError(message);
      throw err;
    } finally {
      setIsStopping(false);
    }
  }, []);

  return {
    status,
    error,
    setError,
    isRunning,
    isStarting,
    isStopping,
    start,
    stop,
  };
}
