import axios from "axios";

// Very difficult (impossible?) to load heroku environment variables into react app.
// Thus, opt to override it with a local environment variable for development instead.
// This requires an extra .env to be placed inside "/client" folder.
const URL: string = process.env.REACT_APP_URL || "https://organius.herokuapp.com/";

export default axios.create({
  baseURL: URL,
});
