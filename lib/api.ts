import axios from "axios";

const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {

      if (typeof window !== "undefined") {

        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/auth/login";
        }

      }

      // Stop error propagation
      return Promise.resolve({ data: null });
    }

    return Promise.reject(error);
  }
);

export default api;