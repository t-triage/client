const express = require("express")
const path = require("path")
const fs = require("fs")
const yaml = require("js-yaml")
const http = require('http')

const app = express()


var config = ""

loadConfig = () => {
    config = yaml.safeLoad(fs.readFileSync("config.yml", "utf8"))
}

loadConfig()

fs.watchFile("config.yml", (curr, prev) => {
    console.log("Config file has changed, reapplying config.")
    loadConfig()
})

const port = config.port || process.env.PORT || 8080

app.use(express.static(path.resolve(__dirname, "build")))

app.use(function(req, res, next) {
    //res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/config", (req, res) => {
    res.send(JSON.stringify(config))
})

app.get("/healthCheck", (req, res) => {
   http.get(config.apiurl + '/v1/info/build', (resp) => {
     resp.on('data', (data) => {
       res.send(data)
     })
   })
 })

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build/index.html"))
})


app.listen(port, () => {
    console.log("Front started on port %s", port)
})
