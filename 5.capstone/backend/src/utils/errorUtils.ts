export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const successResponse = (
  res: any,
  data: Record<string, any>,
  message = "Success",
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

export const errorResponse = (res: any, error: any, status = 500) => {
  const message =
    error instanceof ApiError ? error.message : "Internal Server Error";
  const errorStatus = error instanceof ApiError ? error.status : status;

  return res.status(errorStatus).json({
    success: false,
    error: message,
  });
};
