const express = require("express");
const cors = require("cors");
const ngrok = require("ngrok")
const routes = require("./config/routes")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);

const port = process.env.PORT || 8023;

app.listen(port, async () => {
    console.log("Server running on port: http://localhost:" + port);

    // try {
    //     const ngrokUrl = await ngrok.connect(port);
    //     console.log(`Ngrok tunnel established at: ${ngrokUrl}`);
    // } catch (error) {
    //     console.error(`Couldn't establish Ngrok tunnel:`, error);
    // }
});