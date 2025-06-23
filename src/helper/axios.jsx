import axios from "axios";

// Set the baseURL dynamically using an environment variable or a default value
const ApiAxios = axios.create({
  // baseURL: "https://86db-2405-201-37-21d9-c12a-b69a-b605-8271.ngrok-free.app/",
  // baseURL: "https://api.maitriai.com/aryan_properties",
  // baseURL: "http://192.168.29.83:8004/",
   baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": true,
  },
});

export default ApiAxios;
