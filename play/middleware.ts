import type { ErrorRequestHandler, RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

let count = 0;

export const requestId: RequestHandler = (req, res, next) => {
  count += 1;
  req.requestId = `r${count}`;
  next();
};

export const logger: RequestHandler = (req, res, next) => {
  res.on("finish", () => {
    console.log(`${req.requestId} ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
};

// four parameters: that's how Express knows an error handler
export const onError: ErrorRequestHandler = (err: unknown, req, res, next) => {
  console.error(`${req.requestId} ${err}`);
  res.status(500).json({ error: "internal error", requestId: req.requestId });
};
