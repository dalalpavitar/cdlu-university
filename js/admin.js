var ADMIN_PASS = 'cdlu@2026';

function adminLogin() {
  var pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    localStorage.setItem('cdluAdminLoggedIn', 'true');
    renderRegistrations();
  } else {
    alert('Incorrect password. Try: cdlu@2026');
  }
}

function adminLogout() {
  localStorage.removeItem('cdluAdminLoggedIn');
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
}

function getRegistrations() {
  return JSON.parse(localStorage.getItem('cdluRegistrations') || '[]');
}

function renderRegistrations() {
  var data = getRegistrations();
  var search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  var tbody = document.getElementById('regBody');
  var noMsg = document.getElementById('noDataMsg');

  if (search) {
    data = data.filter(function (r) {
      return r.name?.toLowerCase().includes(search) ||
             r.phone?.includes(search) ||
             r.id?.toLowerCase().includes(search) ||
             r.fatherName?.toLowerCase().includes(search);
    });
  }

  document.getElementById('totalCount').textContent = getRegistrations().length;
  var today = new Date().toISOString().slice(0, 10);
  document.getElementById('todayCount').textContent = getRegistrations().filter(function (r) {
    return r.registeredOn?.slice(0, 10) === today;
  }).length;
  document.getElementById('pendingCount').textContent = getRegistrations().length;

  if (data.length === 0) {
    tbody.innerHTML = '';
    noMsg.style.display = 'block';
    return;
  }
  noMsg.style.display = 'none';

  var html = '';
  data.forEach(function (r, i) {
    var d = r.dob ? new Date(r.dob).toLocaleDateString('en-IN') : '-';
    var regDate = r.registeredOn ? new Date(r.registeredOn).toLocaleString('en-IN') : '-';
    html += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><strong>' + (r.id || '-') + '</strong></td>' +
      '<td>' + (r.name || '-') + '</td>' +
      '<td>' + (r.fatherName || '-') + '</td>' +
      '<td>' + d + '</td>' +
      '<td>' + (r.gender || '-') + '</td>' +
      '<td>' + (r.category || '-') + '</td>' +
      '<td>' + (r.phone || '-') + '</td>' +
      '<td>' + (r.email || '-') + '</td>' +
      '<td>' + (r.programme || '-') + '</td>' +
      '<td>' + (r.qualification || '-') + '</td>' +
      '<td>' + (r.percentage || '-') + '</td>' +
      '<td>' + regDate + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = html;
}

function filterRegistrations() {
  renderRegistrations();
}

function exportCSV() {
  var data = getRegistrations();
  if (data.length === 0) { alert('No data to export.'); return; }
  var headers = ['Reg ID', 'Name', "Father's Name", 'DOB', 'Gender', 'Category', 'Phone', 'Email', 'Programme', 'Qualification', 'Percentage', 'Address', 'Registered On'];
  var csv = headers.join(',') + '\n';
  data.forEach(function (r) {
    var row = [
      r.id || '', r.name || '', r.fatherName || '', r.dob || '', r.gender || '',
      r.category || '', r.phone || '', r.email || '', r.programme || '',
      r.qualification || '', r.percentage || '', (r.address || '').replace(/,/g, ';'), r.registeredOn || ''
    ];
    csv += row.join(',') + '\n';
  });
  downloadFile(csv, 'cdlu-registrations.csv', 'text/csv');
}

function exportJSON() {
  var data = getRegistrations();
  if (data.length === 0) { alert('No data to export.'); return; }
  downloadFile(JSON.stringify(data, null, 2), 'cdlu-registrations.json', 'application/json');
}

function downloadFile(content, filename, mime) {
  var blob = new Blob([content], { type: mime });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function printReport() {
  window.print();
}

function clearAllData() {
  if (confirm('Are you sure you want to delete ALL registrations?')) {
    if (confirm('This cannot be undone. Proceed?')) {
      localStorage.removeItem('cdluRegistrations');
      renderRegistrations();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('cdluAdminLoggedIn') === 'true') {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderRegistrations();
  }
});
