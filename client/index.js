window.addEventListener('DOMContentLoaded'){
  let logInForm = document.getElementById('logInForm');
  let signUpForm = document.getElementById('signUpForm');

  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //will need logic to make post request to server to log in
  })


  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //will need logic to make post request to sign up
  })
}