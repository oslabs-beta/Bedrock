document.addEventListener('DOMContentLoaded', () => {
  const logInForm = document.getElementById('logInForm');
      
  logInForm.addEventListener('submit', async (e) => {
    const loginUser = document.getElementById('logInUsername').value;
    const loginPass = document.getElementById('logInPassword').value;
      
    e.preventDefault();
    console.log('submitted form!')
    //will need logic to make post request to server to log in
    try{
      const userCheck = await fetch('/login', {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUser,
          password: loginPass
        })
      })
      console.log(userCheck)
      window.location.replace(userCheck.url);

    } 
    catch(err){
      console.log('there was an error when logging in! the error was: ', err);
    }
      
  })  
})
  