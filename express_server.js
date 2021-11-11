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

//user database for register
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}



//add cookie 
app.post('/login', (req, res) => {

  //const username = req.body.username;
  const user = users[req.cookies["id"]];
  res.cookie('user',user);
  res.redirect('/urls');


});

//delete cookie (username)
app.post("/logout", (req, res)=> {
  let user = users[req.cookies["id"]];
  res.clearCookie('id', user);
  res.redirect("/urls");
});


//user register
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
let user ={email: req.body.email, password:req.body.password};
  
  let getId = emailLookup(user);
  console.log('user:====>',getId);
  if(getId){
    let id = generateRandomString();
  users[id] = {id: id, email: req.body.email, password:req.body.password};
  //console.log(users);
    res.cookie('id',id);
  res.redirect("/urls");
 // console.log(users);
  } else {
    res.send(" Error 400");
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
  
  const user = users[req.cookies["id"]];
  //
  
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["id"]];
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const user = users[req.cookies["id"]];
  const templateVars = {user: user, shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  res.render("urls_show", templateVars);
  


});
//db update
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





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});

function emailLookup(user) {
  // if(user.email === null || user.password === null) {
  //   return false;
  // }
if(user.email !== "" && user.password !== "") {
  for (let key in users) {
    if (users[key].email === user.email) {
      return false;
    }
    
    
  }
  return true;
}
return false;

}




function generateRandomString() {

  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let result = ' ';
    const charactersLength = 6;
    for ( let i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
