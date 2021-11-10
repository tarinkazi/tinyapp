const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
app.use(cookieParser())



app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//add cookie 
app.post('/login', (req, res) => {

  const username = req.body.username;
  
  console.log(res.cookie('username',username));
  res.redirect('/urls');


});

//delete cookie (username)
app.post("/logout", (req, res)=> {
  let username = req.body.username
  res.clearCookie('username', username)

  res.redirect("/urls")
});



app.get("/", (req, res) => {
  res.send("Hello");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
 const templateVars = { greeting: 'Hello World2', run: 'hi'};
 res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let username = req.cookies["username"];
  const templateVars = { username: username, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let username = req.cookies["username"];
  const templateVars = { username: username, urls: urlDatabase };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  let username =  req.cookies["username"];
  const templateVars = {username: username, shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  res.render("urls_show", templateVars);
  


});

app.post("/urls", (req, res) => {
  let msg = req.body;
  for(let key in msg) {
    msg = msg[key];
  }
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  
  res.redirect(`/urls/${shortUrl}`);
  console.log(req.body);

});


//update
app.post("/urls/:shortURL", (req, res) => {
  
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl]= longUrl;
res.redirect('/urls');

});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
 
  const longUrl = urlDatabase[shortUrl];
  res.redirect(longUrl);
});

//for delete
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  
});

app.get("/register", (req, res) => {
  //let username = req.cookies["username"];
  //const templateVars = { username: username, urls: urlDatabase };
  res.render("urls_register",templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

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

