const axios = require("axios");

const URL = "http://localhost:5001/";

const ask = async (path) => {
  try {
    const response = await axios.get(URL + path);
    if (response.status !== 200) {
      return [{ error: "An error occurred while fetching" }];
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const askAutomation = async (path, data) => {
  try {
    const response = await axios.post(URL + path, data);
    if (response.status !== 200) {
      return [{ error: "An error occurred while fetching" }];
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  ask,
  askAutomation
};
