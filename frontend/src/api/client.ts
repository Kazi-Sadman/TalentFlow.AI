import axios from "axios";

// All API calls use this one axios object.
// In development the baseURL is "/api" and the Vite proxy forwards it to the backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

// Add the JWT token to every request
api.interceptors.request.use(function (config) {
  const token = localStorage.getItem("tf_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// If the token is not valid any more (401), log the user out
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const url: string = error.config && error.config.url ? error.config.url : "";
    const isAuthCall = url.indexOf("/auth/") >= 0;

    if (error.response && error.response.status === 401 && !isAuthCall) {
      localStorage.removeItem("tf_token");
      localStorage.removeItem("tf_user");
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

interface ErrorBody {
  message?: string;
  errors?: string[];
}

// Turns any error into a short message that we can show to the user
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data as ErrorBody | undefined;
      if (data && !(data instanceof Blob)) {
        if (data.errors && data.errors.length > 0) {
          return data.errors.join(" ");
        }
        if (data.message) {
          return data.message;
        }
      }
      return "The request failed (error " + error.response.status + ").";
    }
    return "Cannot reach the server. Check that the backend is running.";
  }
  return "Something went wrong. Please try again.";
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response !== undefined && error.response.status === 404;
}
