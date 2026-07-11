const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>CI/CD Pipeline is Working!</h1>");
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
