document.addEventListener('DOMContentLoaded', () => {
      
  const logIn = () => {
    const loginUser = document.getElementById('Username').value;
    const loginPass = document.getElementById('Password').value;
  
    console.log('submitted form!')
    //will need logic to make post request to server to log in
    fetch('/login', {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginUser,
        password: loginPass
      })
    }).then((body) => body.json()).then((body) => {
      
      if (!body.successful) {
        const rootDiv = document.getElementById('login-fields');
        const mfaButton = document.createElement('button');
        mfaButton.setAttribute('type', 'button');
        mfaButton.innerText = 'Submit 2FA code';

        const codeEntry = document.createElement('input');
        codeEntry.setAttribute('type', 'text');
        codeEntry.setAttribute('placeholder', '------');
        codeEntry.style.cssText += 'text-align:center';

        rootDiv.innerHTML = '';
        rootDiv.appendChild(codeEntry);
        rootDiv.appendChild(mfaButton);
      } else {
        document.getElementById('Username').value = '';
        document.getElementById('Password').value = '';
        alert('Incorrect username and/or password! Please try again');
      }
    })
  }

  document.getElementById('loginButton').addEventListener('click', logIn);
})
  