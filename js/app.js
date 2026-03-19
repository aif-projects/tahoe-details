const PAGES = ['itinerary', 'rooms', 'cars'];
const ADMIN_PASSWORD = 'tahoe2026';  // Change this to desired password

// Admin state management
let isAdmin = false;
let editMode = { rooms: false, cars: false };

// Initialize admin status from localStorage
function initAdmin() {
  isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
  updateAdminUI();
}

// Show/hide admin buttons and panel
function updateAdminUI() {
  const adminBtn = document.getElementById('admin-btn');
  const adminPanel = document.getElementById('admin-panel');
  const roomsEditBtn = document.getElementById('rooms-edit-btn');
  const carsEditBtn = document.getElementById('cars-edit-btn');
  
  if (isAdmin) {
    adminBtn.classList.add('logged-in');
    adminPanel.style.display = 'flex';
    roomsEditBtn.style.display = 'inline-block';
    carsEditBtn.style.display = 'inline-block';
  } else {
    adminBtn.classList.remove('logged-in');
    adminPanel.style.display = 'none';
    roomsEditBtn.style.display = 'none';
    carsEditBtn.style.display = 'none';
    exitAllEditModes();
  }
}

// Admin Login
function showLoginModal() {
  if (isAdmin) {
    logout();
  } else {
    document.getElementById('admin-modal').classList.add('active');
    document.getElementById('admin-password').focus();
  }
}

function login(password) {
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem('adminLoggedIn', 'true');
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-message').classList.remove('show');
    document.getElementById('admin-password').value = '';
    updateAdminUI();
  } else {
    const message = document.getElementById('admin-message');
    message.textContent = 'Incorrect password';
    message.classList.add('show');
  }
}

function logout() {
  isAdmin = false;
  localStorage.setItem('adminLoggedIn', 'false');
  document.getElementById('admin-modal').classList.remove('active');
  document.getElementById('admin-message').classList.remove('show');
  document.getElementById('admin-password').value = '';
  updateAdminUI();
}

// Page navigation
function showPage(id, btn) {
  PAGES.forEach(p => {
    document.getElementById('page-' + p).classList.remove('active');
  });
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  history.replaceState(null, '', '#' + id);
}

function initFromHash() {
  const hash = location.hash.replace('#', '');
  const valid = PAGES.includes(hash) ? hash : 'itinerary';
  const btn = document.querySelector(`.nav-tab[data-page="${valid}"]`);
  showPage(valid, btn);
}

// Load data from localStorage
function loadData() {
  const roomsData = localStorage.getItem('roomsData');
  const carsData = localStorage.getItem('carsData');
  
  if (roomsData) {
    try {
      const data = JSON.parse(roomsData);
      Object.keys(data).forEach(roomNum => {
        const row = document.querySelector(`#rooms-table tbody tr[data-room="${roomNum}"]`);
        if (row) {
          row.querySelector('.names-list').textContent = data[roomNum].names;
          row.querySelector('.beds-cell').textContent = data[roomNum].beds;
          row.dataset.beds = data[roomNum].beds;
        }
      });
    } catch (e) {
      console.error('Error loading rooms data:', e);
    }
  }
  
  if (carsData) {
    try {
      const data = JSON.parse(carsData);
      Object.keys(data).forEach(vanKey => {
        const vanCard = document.querySelector(`.van-card[data-van="${vanKey}"]`);
        if (vanCard) {
          const people = vanCard.querySelector('.van-people');
          people.innerHTML = data[vanKey].people.map(p => {
            const isDriver = p === data[vanKey].people[0];
            return `<li ${isDriver ? 'class="driver"' : ''}>${p}</li>`;
          }).join('');
          const count = data[vanKey].people.length;
          vanCard.querySelector('.van-count').textContent = count + ' people';
        }
      });
    } catch (e) {
      console.error('Error loading cars data:', e);
    }
  }
}

// Rooms edit mode
function enterRoomsEditMode() {
  editMode.rooms = true;
  document.getElementById('rooms-edit-btn').style.display = 'none';
  document.getElementById('rooms-edit-controls').style.display = 'flex';
  
  const rows = document.querySelectorAll('#rooms-table tbody tr');
  rows.forEach(row => {
    row.classList.add('edit-mode');
    
    const namesCell = row.querySelector('.names-list');
    const bedsCell = row.querySelector('.beds-cell');
    const originalNames = namesCell.textContent;
    const originalBeds = bedsCell.textContent;
    
    namesCell.innerHTML = `<input type="text" value="${originalNames}">`;
    bedsCell.innerHTML = `<input type="text" value="${originalBeds}">`;
  });
}

function saveRoomsEdit() {
  const data = {};
  const rows = document.querySelectorAll('#rooms-table tbody tr');
  
  rows.forEach(row => {
    const roomNum = row.dataset.room;
    const names = row.querySelector('.names-list input').value;
    const beds = row.querySelector('.beds-cell input').value;
    
    data[roomNum] = { names, beds };
    
    row.querySelector('.names-list').textContent = names;
    row.querySelector('.beds-cell').textContent = beds;
    row.dataset.beds = beds;
    row.classList.remove('edit-mode');
  });
  
  localStorage.setItem('roomsData', JSON.stringify(data));
  exitRoomsEditMode();
}

function exitRoomsEditMode() {
  editMode.rooms = false;
  document.getElementById('rooms-edit-btn').style.display = 'inline-block';
  document.getElementById('rooms-edit-controls').style.display = 'none';
  
  const rows = document.querySelectorAll('#rooms-table tbody tr');
  rows.forEach(row => {
    row.classList.remove('edit-mode');
  });
}

// Cars edit mode
function enterCarsEditMode() {
  editMode.cars = true;
  document.getElementById('cars-edit-btn').style.display = 'none';
  document.getElementById('cars-edit-controls').style.display = 'flex';
  
  const vanCards = document.querySelectorAll('.van-card');
  vanCards.forEach(card => {
    card.classList.add('edit-mode');
    
    const peopleList = card.querySelector('.van-people');
    const people = Array.from(peopleList.querySelectorAll('li')).map(li => li.textContent);
    
    peopleList.innerHTML = people.map(p => `<li><input type="text" value="${p}"></li>`).join('');
    
    // Add "Add person" button
    const addBtn = document.createElement('li');
    addBtn.className = 'add-person-btn';
    addBtn.innerHTML = '<button class="btn btn-secondary" style="width: 100%; margin-top: 8px;">+ Add Person</button>';
    peopleList.appendChild(addBtn);
    
    addBtn.querySelector('button').addEventListener('click', (e) => {
      e.preventDefault();
      const newInput = document.createElement('li');
      newInput.innerHTML = '<input type="text" placeholder="Enter name" style="width: 100%; padding: 6px 8px; border: 1px solid var(--water); border-radius: 4px; font-size: 13px; font-family: inherit; margin-bottom: 4px;">';
      peopleList.insertBefore(newInput, addBtn);
      newInput.querySelector('input').focus();
    });
  });
}

function saveCarEdit() {
  const data = {};
  const vanCards = document.querySelectorAll('.van-card');
  
  vanCards.forEach(card => {
    const vanKey = card.dataset.van;
    const inputs = card.querySelectorAll('.van-people input');
    const people = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(val => val !== ''); // Filter out empty names
    
    data[vanKey] = { people };
    
    const peopleList = card.querySelector('.van-people');
    peopleList.innerHTML = people.map((p, idx) => {
      const isDriver = idx === 0;
      return `<li ${isDriver ? 'class="driver"' : ''}>${p}</li>`;
    }).join('');
    
    const count = people.length;
    card.querySelector('.van-count').textContent = count + ' people';
    card.classList.remove('edit-mode');
  });
  
  localStorage.setItem('carsData', JSON.stringify(data));
  exitCarsEditMode();
}

function exitCarsEditMode() {
  editMode.cars = false;
  document.getElementById('cars-edit-btn').style.display = 'inline-block';
  document.getElementById('cars-edit-controls').style.display = 'none';
  
  const vanCards = document.querySelectorAll('.van-card');
  vanCards.forEach(card => {
    card.classList.remove('edit-mode');
  });
}

function exitAllEditModes() {
  if (editMode.rooms) exitRoomsEditMode();
  if (editMode.cars) exitCarsEditMode();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize
  initAdmin();
  loadData();
  
  // Page navigation
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('admin-tab')) {
        showPage(btn.dataset.page, btn);
      }
    });
  });
  
  // Admin login
  document.getElementById('admin-btn').addEventListener('click', showLoginModal);
  document.getElementById('admin-login-btn').addEventListener('click', () => {
    login(document.getElementById('admin-password').value);
  });
  document.getElementById('admin-cancel-btn').addEventListener('click', () => {
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-message').classList.remove('show');
    document.getElementById('admin-password').value = '';
  });
  document.getElementById('admin-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login(document.getElementById('admin-password').value);
    }
  });
  
  // Close modal when clicking outside
  document.getElementById('admin-modal').addEventListener('click', (e) => {
    if (e.target.id === 'admin-modal') {
      document.getElementById('admin-modal').classList.remove('active');
      document.getElementById('admin-message').classList.remove('show');
      document.getElementById('admin-password').value = '';
    }
  });
  
  // Admin logout
  document.getElementById('admin-logout-btn').addEventListener('click', logout);
  
  // Rooms edit
  document.getElementById('rooms-edit-btn').addEventListener('click', enterRoomsEditMode);
  document.getElementById('rooms-save-btn').addEventListener('click', saveRoomsEdit);
  document.getElementById('rooms-cancel-btn').addEventListener('click', () => {
    exitRoomsEditMode();
    loadData();
  });
  
  // Cars edit
  document.getElementById('cars-edit-btn').addEventListener('click', enterCarsEditMode);
  document.getElementById('cars-save-btn').addEventListener('click', saveCarEdit);
  document.getElementById('cars-cancel-btn').addEventListener('click', () => {
    exitCarsEditMode();
    loadData();
  });
  
  // Hash navigation
  initFromHash();
  window.addEventListener('hashchange', initFromHash);
});
