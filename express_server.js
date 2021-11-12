const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


const bcrypt = require('bcryptjs');

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))



app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

app.get('/login', (req, res) => {
  const user = users[req.session.id];
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_login",templateVars);
});


//add cookie 
app.post('/login', (req, res) => {
  let user ={email: req.body.email, password:req.body.password};
  
  let id = checkingEmailWithPass(user);

  if(id !== false) {
    req.session.id = id;///
    //res.cookie("id",id);
    res.redirect("/urls");
  } else {
    //res.send("Error 403");
    res.status(403).send('Bad Request')   
  }  
});

//delete cookie (username)
app.post("/logout", (req, res)=> {
  let user = users[req.session.id];
  //res.clearCookie('id', user);
  req.session = null;
  res.redirect("/urls");
});


//user register
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
let user ={email: req.body.email, password:req.body.password};
  
  let getMatch = emailLookup(user);
  if(getMatch){
    let id = generateRandomString();
  users[id] = {id: id, email: req.body.email, password:bcrypt.hashSync(req.body.password, 10)};
  
   // res.cookie('id',id);//
    req.session.id = id;
    res.redirect("/urls");
  } else {
    //res.send(" Error 400");
    res.status(400).send('Bad Request')   
  }
  

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
  const user = req.session.id;
  const url = urlsForUser(user);
  console.log('url list:',url);

  if(url !== null) {
    const templateVars ={urls: url, user: users[req.session.id] };
   console.log(templateVars);
   res.render("urls_index",templateVars);

  }

   
});



app.get("/urls/new", (req, res) => {
  const user = users[req.session.id];
  if (user !== undefined) {
  const templateVars = { user: user };
  res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const user = users[req.session.id];
  if(shortUrl === undefined) {
    res.send("400");
  }
   const templateVars = {user: user, shortURL: shortUrl, longURL: urlDatabase[shortUrl].longURL};
  
  res.render("urls_show", templateVars);
  
});
//db update
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
  urlDatabase[shortUrl]= {longURL: longUrl,userID: user};
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});

function checkingEmailWithPass(user){
  if(user.password !=="" && user.email !== "") {
    for(let key in users) {
      //if(users[key].email === user.email && users[key].password === user.password) {
        if(users[key].email === user.email && bcrypt.compareSync(user.password, users[key].password)) {

        return users[key].id;
        
      }

    }
    
  }
  return false;
}

function urlsForUser(id) {

  let urlist = {};
  for(let key in urlDatabase) {
    if(urlDatabase[key].userID === id){
      urlist[key] = urlDatabase[key];
    }
  }

  return urlist;
}

function emailLookup(user) {
  
  if(user.email !== "" && user.password !== "") {
    for (let key in users) {
      if (users[key].email === user.email) {
        return false;
      }
      
    }
    return true;
  }
  return false;

};


function generateRandomString() {

  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = ' ';
    const charactersLength = 6;
    for ( let i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

