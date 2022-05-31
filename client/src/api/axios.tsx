import axios from "axios";

const URL: string = process.env.REACT_APP_URL || "localhost:8080";

console.log(URL);

export default axios.create({
  baseURL: URL,
});
