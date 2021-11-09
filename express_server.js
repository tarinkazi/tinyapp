const express = require('express');
const app = express();
const PORT = 8080;



app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
 // res.send("<html><body>Hello <b>World</b></body></html>\n");
 const templateVars = { greeting: 'Hello World2', run: 'hi'};
 res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
 // console.log(shortUrl+"database:"+urlDatabase[shortUrl]);
  const templateVars = {shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  res.render("urls_show", templateVars);
  //res.redirect(urlDatabase[shortUrl]);


});

app.post("/urls", (req, res) => {
  
  let msg = req.body;
  for(let key in msg) {
    msg = msg[key];
  }
  
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  
  //console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
  console.log(req.body);

});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
 
  const longUrl = urlDatabase[shortUrl];
  res.redirect(longUrl);


});



function generateRandomString() {

  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let result = ' ';
    const charactersLength = 6;
    for ( let i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

