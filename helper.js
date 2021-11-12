const bcrypt = require('bcryptjs');

function getUserByEmail(user, users){
  if(user.password !=="" && user.email !== "") {
    for(let key in users) {
     
        if(users[key].email === user.email && bcrypt.compareSync(user.password, users[key].password)) {

        return users[key].id;
        
      }

    }
    
  }
  return false;
}

function emailLookup(user, users) {
  
  if(user.email !== "" && user.password !== "") {
    for (let key in users) {
      if (users[key].email === user.email) {
        return false;
      }
      
    }
    return true;
  }
  

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


module.exports = {getUserByEmail, emailLookup, generateRandomString};