document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var reg = {
      id: 'CDLU-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      name: document.getElementById('studentName').value.trim(),
      fatherName: document.getElementById('fatherName').value.trim(),
      dob: document.getElementById('dob').value,
      gender: document.getElementById('gender').value,
      category: document.getElementById('category').value,
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      programme: document.getElementById('programme').value,
      qualification: document.getElementById('qualification').value,
      percentage: document.getElementById('percentage').value.trim(),
      address: document.getElementById('address').value.trim(),
      registeredOn: new Date().toISOString()
    };

    var registrations = JSON.parse(localStorage.getItem('cdluRegistrations') || '[]');
    registrations.push(reg);
    localStorage.setItem('cdluRegistrations', JSON.stringify(registrations));

    document.getElementById('regIdDisplay').textContent = reg.id;
    form.style.display = 'none';
    document.getElementById('regSuccess').style.display = 'block';
  });
});
