const PORT = process.env.PORT || 5000
const app = require('./app');

const server=app.listen(PORT, () => {
    console.log("http://localhost:" + PORT);
});

module.exports = server;