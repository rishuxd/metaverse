class ApiError extends Error {
  statusCode: number;
  message: string;
  data: any;
  success: boolean;
  error: any[];
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Something went wrong!",
    data: any = null,
    error: any[] = [],
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = data;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      error: this.error,
    };
  }
}

export default ApiError;
