// for Sidebar menu
document.querySelector('#btn').onclick = function () {
  document.querySelector('.sidebar').classList.toggle('active');
};

document.querySelector('#btnhide').onclick = function () {
  document.querySelector('.sidebar').classList.toggle('active');
};


// /public/js/logout.js
document.getElementById("logout-link").addEventListener("click", async function (e) {
  e.preventDefault(); // Prevent default link behavior

  // SweetAlert confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Logout!'
  });

  if (result.isConfirmed) {
    // Redirect to logout route
    window.location.href = '/logout';
  }
});
