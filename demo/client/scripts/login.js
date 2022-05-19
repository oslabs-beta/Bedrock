document.addEventListener('DOMContentLoaded', () => {

  const checkMFA = () => {
    const MFACode = document.getElementById('code-entry').value;

    fetch('/verifyMFA', {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: MFACode,
      })
    }).then((body) => body.json()).then((body) => {
      console.log(body);
      if (body.mfaVerified) {
        window.location.replace(body.url);
      } else {
        // window.location.reload();
        console.log('error');
      }
    })
  }
      
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
      console.log(body);
      if (body.successful) {
        if (!body.mfa_required) window.location.replace('/secret.html');
        else {
          const rootDiv = document.getElementById('login-fields');
          const mfaButton = document.createElement('button');
          mfaButton.setAttribute('type', 'button');
          mfaButton.addEventListener('click', checkMFA);
          mfaButton.innerText = 'Submit 2FA code';

          const codeEntry = document.createElement('input');
          codeEntry.setAttribute('type', 'text');
          codeEntry.setAttribute('id', 'code-entry');
          codeEntry.setAttribute('placeholder', '------');
          codeEntry.style.cssText += 'text-align:center';
          document.getElementById('github').innerHTML = '';
          rootDiv.innerHTML = '';
          rootDiv.appendChild(codeEntry);
          rootDiv.appendChild(mfaButton);
        }
      } else {
        document.getElementById('Username').value = '';
        document.getElementById('Password').value = '';
        alert('Incorrect username and/or password! Please try again');
      }
    })
  }

  document.getElementById('loginButton').addEventListener('click', logIn);
})
  