import axios from "axios";

/// Initialize Axios for React

export default axios.create(
  {
    baseURL: "http://localhost:8000/api",
    headers: {
      "Content-type": "application/json"
    }
  }
)