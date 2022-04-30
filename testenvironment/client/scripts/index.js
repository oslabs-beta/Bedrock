document.addEventListener('DOMContentLoaded', () => {
  const logInForm = document.getElementById('logInForm');
  const signUpForm = document.getElementById('signUpForm');

  const loginUser = document.getElementById('loginUsername').value;
  const loginPass = document.getElementById('loginPassword').value;
  
  const signUpUser = document.getElementById('signUpUsername').value;
  const signUpPass = document.getElementById('signUpPassword').value;

  logInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('submitted form!')
    //will need logic to make post request to server to log in
    try{
     await fetch('/auth/login', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         username: loginUser,
         password: loginPass
       })
     })
    } 
    catch(err){
      console.log('there was an error when logging in! the error was: ', err);
    }
    
  })


  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    //will need logic to make post request to sign up
    console.log('submitted form!')
    //will need logic to make post request to server to log in
    try{
      await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signUpUser,
          password: signUpPass
        })
      })
    } 
    catch(err){
      console.log('there was an error when logging in! the error was: ', err);
    }
  })


})
