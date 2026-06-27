var ADMIN_PASS = 'cdlu@2026';
var allRegistrations = [];
var firebaseReady = false;

function adminLogin() {
  var pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    localStorage.setItem('cdluAdminLoggedIn', 'true');
    startListening();
  } else {
    alert('Incorrect password. Try: cdlu@2026');
  }
}

function adminLogout() {
  localStorage.removeItem('cdluAdminLoggedIn');
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
}

function getLocalRegistrations() {
  return JSON.parse(localStorage.getItem('cdluRegistrations') || '[]');
}

function renderRegistrations() {
  var data = allRegistrations;
  var search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  var tbody = document.getElementById('regBody');
  var noMsg = document.getElementById('noDataMsg');

  if (search) {
    data = data.filter(function (r) {
      return (r.name || '').toLowerCase().includes(search) ||
             (r.phone || '').includes(search) ||
             (r.id || '').toLowerCase().includes(search) ||
             (r.fatherName || '').toLowerCase().includes(search);
    });
  }

  document.getElementById('totalCount').textContent = allRegistrations.length;
  var today = new Date().toISOString().slice(0, 10);
  document.getElementById('todayCount').textContent = allRegistrations.filter(function (r) {
    return (r.registeredOn || '').slice(0, 10) === today;
  }).length;
  document.getElementById('pendingCount').textContent = allRegistrations.length;

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

function startListening() {
  // Load localStorage data first
  allRegistrations = getLocalRegistrations();
  renderRegistrations();

  if (typeof db !== 'undefined') {
    // Real-time listener from Firebase
    db.collection('registrations').orderBy('registeredOn', 'desc').onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === 'added' || change.type === 'modified') {
          var data = change.doc.data();
          // Check if already exists in local array by id
          var exists = allRegistrations.some(function (r) { return r.id === data.id; });
          if (!exists) {
            allRegistrations.unshift(data);
          } else {
            // Update existing
            allRegistrations = allRegistrations.map(function (r) {
              return r.id === data.id ? data : r;
            });
          }
        }
        if (change.type === 'removed') {
          allRegistrations = allRegistrations.filter(function (r) {
            return r.id !== change.doc.data().id;
          });
        }
      });
      // Merge with local data (in case Firebase has more)
      var localData = getLocalRegistrations();
      localData.forEach(function (lr) {
        var exists = allRegistrations.some(function (r) { return r.id === lr.id; });
        if (!exists) allRegistrations.push(lr);
      });

      // Sync local storage with Firebase data
      localStorage.setItem('cdluRegistrations', JSON.stringify(allRegistrations));
      firebaseReady = true;
      renderRegistrations();
    }, function (err) {
      console.warn('Firebase listener error:', err);
    });
  }
}

function filterRegistrations() {
  renderRegistrations();
}

function exportCSV() {
  if (allRegistrations.length === 0) { alert('No data to export.'); return; }
  var headers = ['Reg ID', 'Name', "Father's Name", 'DOB', 'Gender', 'Category', 'Phone', 'Email', 'Programme', 'Qualification', 'Percentage', 'Address', 'Registered On'];
  var csv = headers.join(',') + '\n';
  allRegistrations.forEach(function (r) {
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
  if (allRegistrations.length === 0) { alert('No data to export.'); return; }
  downloadFile(JSON.stringify(allRegistrations, null, 2), 'cdlu-registrations.json', 'application/json');
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
      allRegistrations = [];
      if (typeof db !== 'undefined') {
        // Delete from Firebase too
        db.collection('registrations').get().then(function (snapshot) {
          var batch = db.batch();
          snapshot.forEach(function (doc) { batch.delete(doc.ref); });
          return batch.commit();
        }).catch(function (err) {
          console.warn('Firebase delete error:', err);
        });
      }
      renderRegistrations();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('cdluAdminLoggedIn') === 'true') {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    startListening();
  }
});
