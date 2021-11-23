const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const {getUserByEmail, emailLookup, generateRandomString, urlsForUser} = require('./helper');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


//URL database
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
//user database for register
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

//Login
app.get('/login', (req, res) => {
  const user = users[req.session.id];
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_login",templateVars);
});


//add cookie Login
app.post('/login', (req, res) => {
  const user ={email: req.body.email, password:req.body.password};
  const id = getUserByEmail(user, users);

  if(id !== false) {
    req.session.id = id;
    return res.redirect("/urls");
  } else {
       return res.status(403).send('Invalid User ID or Password');
    }  
});

//delete cookie (username) from logout
app.post("/logout", (req, res)=> {
  const user = users[req.session.id];
  req.session = null;
  res.redirect("/urls");
});

//user register
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//User post register
app.post("/register", (req, res) => {
  const user ={email: req.body.email, password:req.body.password};
  const getMatch = emailLookup(user, users);
  
  if(getMatch){
    const id = generateRandomString();
    users[id] = {id: id, email: req.body.email, password:bcrypt.hashSync(req.body.password, 10)};
    req.session.id = id;
    res.redirect("/urls");
  } else {
      res.status(400).send('Invalid User ID or Password');
    }
});

//Urls 
app.get("/urls", (req, res) => {
  const user = req.session.id;
  const url = urlsForUser(user, urlDatabase);
console.log("url",url);
  if(user) {
    const templateVars ={urls: url, user: users[req.session.id] };
   return res.render("urls_index",templateVars);
  } else {
    return res.status(400).send("To access TinyApp, please <a href= '/login'> login </a> or <a href= '/register'> register </a>");
  }
});

//New Url
app.get("/urls/new", (req, res) => {
  const user = users[req.session.id];
  if (user !== undefined) {
    const templateVars = { user: user };
    res.render("urls_new",templateVars);
  } else {
      res.redirect("/login");
      return res.status(400).send("Please login or register to create a new URL");
    }
});

//edit/create url
app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const user = users[req.session.id];
  
  if(user === undefined) {
    res.status(400).send(`Sorry, you're not authorized to view or edit this URL.`);
  }
  
  if(shortUrl === undefined) {
    res.status(400).send(`The short URL you've entered doesn't match with an existing long URL Request`);  
  }
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
   const templateVars = {user: user, shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  res.render("urls_show", templateVars);
  } else {
    res.status(400).send('Invalid Access of ShortURL');  
  }
});

//db update urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user = req.session.id;
  urlDatabase[shortURL] = {longURL: longURL,userID: user};
  res.redirect(`urls/${shortURL}`);
});

//update
app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longURL;
  const user = req.session.id;
  const user_id = users[req.session.id];
  
  if(user_id === undefined) {
    res.status(400).send('Unauthorized User for Edit the URL');
  }
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
  urlDatabase[shortUrl]= {longURL: longUrl,userID: user};
  res.redirect('/urls');
  } else {
    res.status(400).send('Unauthorized User for Edit the URL');
  }
});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const validShortURL = urlDatabase[shortURL];
  if(!validShortURL){
    return res.status(400).send("Sorry, there is no longURL associated with the shortURL provided");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//for delete
app.post("/urls/:shortURL/delete", (req, res) => {

  const user_id = users[req.session.id];
  
  if(user_id === undefined) {
    res.status(400).send('Unauthorized User for delete the URL');
  }
 
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    res.status(400).send('Unauthorized User for delete the URL');
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

////////Partial get
app.get("/", (req, res) => {
  if(req.session.id){
    res.redirect("/login");
  }
  res.redirect("/urls");
});






