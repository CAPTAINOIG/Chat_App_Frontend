import axiosInstance from "../../utils/AxiosInstance";

export const signUp = async (user) => {
  const response = await axiosInstance.post("/user/signup", user);
  return response.data;
};

export const signIn = async (user) => {
  const response = await axiosInstance.post("/user/signin", user);
  return response.data;
};

export const dashboard = async () => {
  const response = await axiosInstance.get("/user/dashboard");
  return response.data;
};

export const googleAuth = async (googleToken) => {
  const response = await axiosInstance.post("/user/googleAuth", { googleToken });
  return response.data;
}

export const getMessage = async (userId, senderId) => {
  const response = await axiosInstance.get(`/user/getMessage?userId=${userId}&receiverId=${senderId}`);
  return response.data;
}