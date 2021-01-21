const { generateRandomString } = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

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
};

const emailCheck = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return false;
    }
  }
  return true;
};

const findUser = (users, email, password) => {
  for (const user in users) {
    if (users[user].email === email && users[user].password === password) {
      return user;
    } else if (users[user].email === email && users[user].password !== password) {
      return 'wrong password';
    }
  }
  return false;
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { user_id: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { user_id: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user_id: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${randomShortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL };
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = findUser(users, email, password);
  if (id === 'wrong password') {
    res.sendStatus(403);
  } else if (id && id !== 'wrong password') {
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render('urls_login', templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  if (email && password && emailCheck(email)) {
    users[id] = {
      id : id,
      email: email,
      password: password
    };
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});