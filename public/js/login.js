document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    username: formData.get('username'),
    password: formData.get('password')
  };

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (result.success) {
    // Login success
    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      window.location.href = '/dashboard'; // 🔁 Redirect to dashboard
    });
  } else {
    // Login failed
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: result.message
    });
  }
});