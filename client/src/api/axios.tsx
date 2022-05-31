import axios from "axios";

const URL: string = "http://" + (process.env.REACT_APP_URL || "localhost:8080");

export default axios.create({
  baseURL: URL,
});
