document.addEventListener('DOMContentLoaded', () => {    
  const signUpForm = document.getElementById('signUpForm');  
        
  signUpForm.addEventListener('submit', async (e) => {
    const signUpUser = document.getElementById('signUpUsername').value;
    const signUpPass = document.getElementById('signUpPassword').value;
    e.preventDefault();

        //will need logic to make post request to sign up
        console.log("user: ", signUpUser)
        console.log("pass: ", signUpPass)
        console.log('submitted form!')
        //will need logic to make post request to server to log in
        try{
        await fetch('/signup', {
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
  