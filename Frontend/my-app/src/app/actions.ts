
export const registerUser = async (userData: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}): Promise<any> => {  // Changed return type to any to match backend response
  try {
    const requestData = {