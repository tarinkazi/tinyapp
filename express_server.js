const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const {getUserByEmail, emailLookup, generateRandomString} = require('./helper');
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
    res.redirect("/urls");
  } else {
      res.status(403).send('Bad Request')   
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
      res.status(400).send('Bad Request')   
    }
});

//Urls 
app.get("/urls", (req, res) => {
  const user = req.session.id;
  const url = urlsForUser(user);

  if(url !== null) {
    const templateVars ={urls: url, user: users[req.session.id] };
   res.render("urls_index",templateVars);
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
    }
});

//edit/create url
app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const user = users[req.session.id];
  
  if(user === undefined) {
    res.status(400).send('Bad Request');
  }
  
  if(shortUrl === undefined) {
    res.status(400).send('Bad Request');  
  }
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
   const templateVars = {user: user, shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  res.render("urls_show", templateVars);
  } else {
    res.status(400).send('Bad Request');  
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
    res.status(400).send('Bad Request');
  }
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
  urlDatabase[shortUrl]= {longURL: longUrl,userID: user};
  res.redirect('/urls');
  } else {
    res.status(400).send('Bad Request');
  }
});

app.get("/u/:shortURL", (req, res) => {

  if (urlDatabase[req.params.shortURL]) {
    const { longURL } = urlDatabase[req.params.shortURL];
    return res.redirect(longURL);
  } 
    res.status(400).send('Bad Request');
});

//for delete
app.post("/urls/:shortURL/delete", (req, res) => {

  const user_id = users[req.session.id];
  
  if(user_id === undefined) {
    res.status(400).send('Bad Request');
  }
 
  if(urlDatabase[req.params.shortURL].userID === req.session.id) {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    res.status(400).send('Bad Request');
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


////////
function urlsForUser(id) {
  const urlist = {};
  for(let key in urlDatabase) {
    if(urlDatabase[key].userID === id){
      urlist[key] = urlDatabase[key];
    }
  }
  return urlist;
};

////////Partial get
app.get("/", (req, res) => {
  if(req.session.id){
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
 const templateVars = { greeting: 'Hello World2', run: 'hi'};
 res.render("hello_world", templateVars);
});






