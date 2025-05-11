document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {
    username: formData.get('username'),
    password: formData.get('password')
  };

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Login successful
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = '/dashboard';
      });
    } else {
      // Login failed (show error message)
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: result.message
      });
    }
  } catch (error) {
    // Server error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again.'
    });
  }
});
