require("dotenv").config();

module.exports = {
    env: {
        REACT_APP_API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
    },
    target: 'serverless'
};
