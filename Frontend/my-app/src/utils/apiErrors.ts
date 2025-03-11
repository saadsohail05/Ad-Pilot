export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.detail || 'An error occurred', response.status);
  }
  return response.json();
};

export const validateScheduleTime = (date: string, time: string): boolean => {
  const scheduledTime = new Date(`${date}T${time}:00`);
  const minTime = new Date();
  minTime.setMinutes(minTime.getMinutes() + 20); // Must be at least 20 mins in future
  
  return scheduledTime > minTime;
};