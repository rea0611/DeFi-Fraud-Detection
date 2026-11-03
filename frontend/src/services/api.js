

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result;
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result;
  }
};

export const getData = (endpoint) => API.get(endpoint);
export const postData = (endpoint, data) => API.post(endpoint, data);

export const get = API.get;
export const post = API.post;

export default API;


