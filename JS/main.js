/* ══════════════════════════════════════════
   ContactHub — main.js
   ══════════════════════════════════════════ */

// ── Data ──────────────────────────────────────────────────────────────
var contacts      = JSON.parse(localStorage.getItem('contacthub_contacts') || '[]');
var nextId        = parseInt(localStorage.getItem('contacthub_nextId') || '1');
var currentFilter = 'all';

var contactsGrid  = document.getElementById('contactsGrid');
var searchInput   = document.getElementById('searchInput');
var emptyState    = document.getElementById('emptyState');
var favPanel      = document.getElementById('favPanel');
var favEmpty      = document.getElementById('favEmpty');
var emrgPanel     = document.getElementById('emrgPanel');
var emrgEmpty     = document.getElementById('emrgEmpty');

// ── Save to localStorage ──────────────────────────────────────────────
function saveData() {
    localStorage.setItem('contacthub_contacts', JSON.stringify(contacts));
    localStorage.setItem('contacthub_nextId',   String(nextId));
}

// ── Get initials from name ────────────────────────────────────────────
function getInitials(name) {
    var words  = name.trim().split(/\s+/);
    var result = '';
    for (var i = 0; i < words.length && result.length < 2; i++) {
        result += words[i][0];
    }
    return result.toUpperCase();
}

// ── Capitalize first letter ───────────────────────────────────────────
function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Random avatar color ───────────────────────────────────────────────
var colorOptions = ['pink-grad', 'blue-grad', 'orange-grad', 'green-grad', 'purple-grad'];
function randomColor() {
    return colorOptions[Math.floor(Math.random() * colorOptions.length)];
}

// ── Build tags HTML ───────────────────────────────────────────────────
function buildTags(category, emergency) {
    var html = '';
    if (category)  html += '<span class="tag tag-' + category + '">' + capitalize(category) + '</span>';
    if (emergency) html += '<span class="tag tag-emergency"><i class="fas fa-heartbeat me-1"></i>Emergency</span>';
    return html;
}

// ── Filter contacts list ──────────────────────────────────────────────
function getFilteredList() {
    var q    = (searchInput.value || '').toLowerCase();
    var list = [];

    for (var i = 0; i < contacts.length; i++) {
        var c      = contacts[i];
        var matchQ = !q
            || c.name.toLowerCase().includes(q)
            || c.phone.includes(q)
            || (c.email || '').toLowerCase().includes(q);

        if (!matchQ) continue;

        if (currentFilter === 'all')                       list.push(c);
        else if (currentFilter === 'favorite'  && c.favorite)  list.push(c);
        else if (currentFilter === 'emergency' && c.emergency) list.push(c);
        else if (currentFilter === c.category)             list.push(c);
    }
    return list;
}

// ── Render contacts grid ──────────────────────────────────────────────
function renderContacts() {
    var list   = getFilteredList();
    var cards  = '';

    // Empty state
    if (contacts.length === 0) {
        emptyState.style.display         = 'flex';
        emptyState.style.flexDirection   = 'column';
        emptyState.style.alignItems      = 'center';
        emptyState.style.justifyContent  = 'center';
    } else {
        emptyState.style.display = 'none';
    }

    // No results after search/filter
    if (list.length === 0 && contacts.length > 0) {
        cards = '<div class="col-12"><div class="empty-state"><i class="fas fa-user-slash d-block"></i><p>No contacts found</p></div></div>';
    } else {

        for (var i = 0; i < list.length; i++) {
            var c = list[i];

            // Badge dot
            var badgeDot = '';
            if (c.favorite) {
                badgeDot = '<div class="badge-dot"><i class="fas fa-star" style="font-size:.5rem"></i></div>';
            } else if (c.emergency) {
                badgeDot = '<div class="badge-dot emergency"><i class="fas fa-heartbeat" style="font-size:.5rem"></i></div>';
            }

            // Email row
            var emailRow = '';
            if (c.email) {
                emailRow = '<div class="contact-info mb-2"> <div class="phone-1 sat-2">  <i class="fas fa-envelope" style="color:#7F22FE;"></i>  </div>   ' + c.email + '</div>';
            }

            // Address row
            var addressRow = '';
            if (c.address) {
                addressRow = '<div class="contact-info mb-2"> <div class="phone-1 sat-3">  <i class="fas fa-map-marker-alt" style="color:#009966;" ></i> </div> ' + c.address + '</div>';
            }

            // Email button
            var emailBtn = '';
            if (c.email) {
                emailBtn = '<button class="action-btn btn-email" title="Email" onclick="emailContact(\'' + c.email + '\')"><i class="fas fa-envelope"></i></button>';
            }

            // Star button style
            var starStyle = c.favorite  ? 'background:#f7923a;color:#fff' : '';
            var heartStyle = c.emergency ? 'background:#e94560;color:#fff' : '';

            cards +=
                '<div class="col-md-6" id="card-' + c.id + '">' +
                    '<div class="contact-card">' +

                        '<div class="d-flex align-items-center gap-3 mb-3">' +
                            '<div class="avatar-wrap">' +
                                '<div class="avatar ' + c.color + '">' + getInitials(c.name) + '</div>' +
                                badgeDot +
                            '</div>' +
                            '<div>' +
                                '<p class="contact-name mb-1">' + c.name + '</p>' +
                                '<div class="contact-info mb-0">   <div class="phone-1 sat-1"> <i class="fas fa-phone" style="color:#155DFC;"></i> </div>   ' + c.phone + '</div>' +
                            '</div>' +
                        '</div>' +

                        emailRow +
                        addressRow +
                        '<div class="mb-2">' + buildTags(c.category, c.emergency) + '</div>' +

                        '<div class="card-actions">' +
                            '<div class="left">' +
                                '<button class="action-btn btn-call" title="Call" onclick="callContact(\'' + c.phone + '\')"><i class="fas fa-phone"></i></button>' +
                                emailBtn +
                            '</div>' +
                            '<div class="right">' +
                                '<button class="action-btn btn-star"  title="Favorite"  onclick="toggleFav(' + c.id + ')"  style="' + starStyle  + '"><i class="fas fa-star"></i></button>' +
                                '<button class="action-btn btn-heart" title="Emergency" onclick="toggleEmrg(' + c.id + ')" style="' + heartStyle + '"><i class="fas fa-heartbeat"></i></button>' +
                                '<button class="action-btn btn-edit"  title="Edit"      onclick="openEdit(' + c.id + ')"><i class="fas fa-pen"></i></button>' +
                                '<button class="action-btn btn-del"   title="Delete"    onclick="deleteContact(' + c.id + ')"><i class="fas fa-trash"></i></button>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>';
        }
    }

    contactsGrid.innerHTML = cards;
    renderStats();
    renderPanels();

    var subtitle = document.getElementById('contacts-subtitle');
    if (subtitle) {
        subtitle.textContent = 'Manage and organize your ' + contacts.length + ' contact' + (contacts.length !== 1 ? 's' : '');
    }
}

// ── Render stat numbers ───────────────────────────────────────────────
function renderStats() {
    var totalFav  = 0;
    var totalEmrg = 0;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].favorite)  totalFav++;
        if (contacts[i].emergency) totalEmrg++;
    }
    document.getElementById('stat-total').textContent = contacts.length;
    document.getElementById('stat-fav').textContent   = totalFav;
    document.getElementById('stat-emrg').textContent  = totalEmrg;
}

// ── Render side panels ────────────────────────────────────────────────
function renderPanels() {
    var favRows  = '';
    var emrgRows = '';

    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].favorite)  favRows  += buildPanelRow(contacts[i]);
        if (contacts[i].emergency) emrgRows += buildPanelRow(contacts[i]);
    }

    favPanel.innerHTML  = favRows;
    emrgPanel.innerHTML = emrgRows;

    favEmpty.style.display  = favRows  ? 'none' : 'block';
    emrgEmpty.style.display = emrgRows ? 'none' : 'block';
}

// ── Panel row ─────────────────────────────────────────────────────────
function buildPanelRow(c) {
    return '<div class="panel-contact px-3 pb-2">' +
                '<div class="avatar ' + c.color + '" style="width:38px;height:38px;font-size:.85rem;border-radius:10px;flex-shrink:0;">' +
                    getInitials(c.name) +
                '</div>' +
                '<div class="info">' +
                    '<strong class="sdjw">' + c.name + '</strong>' +
                    '<span>' + c.phone + '</span>' +
                '</div>' +
                '<button class="call-btn" onclick="callContact(\'' + c.phone + '\')">' +
                    '<i class="fas fa-phone"></i>' +
                '</button>' +
            '</div>';
}

// ── Toggle favorite ───────────────────────────────────────────────────
function toggleFav(id) {
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            contacts[i].favorite = !contacts[i].favorite;
            break;
        }
    }
    saveData();
    renderContacts();
}

// ── Toggle emergency ──────────────────────────────────────────────────
function toggleEmrg(id) {
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            contacts[i].emergency = !contacts[i].emergency;
            break;
        }
    }
    saveData();
    renderContacts();
}

// ── Delete contact ────────────────────────────────────────────────────
function deleteContact(id) {
    var c = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) { c = contacts[i]; break; }
    }
    if (!c) return;

    Swal.fire({
        title: 'Delete Contact?',
        text: 'Are you sure you want to delete "' + c.name + '"? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e94560',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(function(result) {
        if (result.isConfirmed) {
            var newList = [];
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].id !== id) newList.push(contacts[i]);
            }
            contacts = newList;
            saveData();
            renderContacts();
            Swal.fire({
                title: 'Deleted!',
                text: '"' + c.name + '" has been deleted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// ── Call / Email shortcuts ────────────────────────────────────────────
function callContact(phone)  { window.location.href = 'tel:'    + phone; }
function emailContact(email) { window.location.href = 'mailto:' + email; }

// ── Add contact ───────────────────────────────────────────────────────
function addContact() {
    var nameInput  = document.getElementById('inp-name');
    var phoneInput = document.getElementById('inp-phone');
    var err        = document.getElementById('form-error');

    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        err.classList.remove('d-none');
        return;
    }
    err.classList.add('d-none');

    contacts.push({
        id:        nextId++,
        name:      nameInput.value.trim(),
        phone:     phoneInput.value.trim(),
        email:     document.getElementById('inp-email').value.trim(),
        address:   document.getElementById('inp-address').value.trim(),
        notes:     document.getElementById('inp-notes').value.trim(),
        category:  document.getElementById('inp-category').value,
        color:     randomColor(),
        favorite:  document.getElementById('inp-fav').checked,
        emergency: document.getElementById('inp-emrg').checked
    });

    saveData();
    clearAddForm();
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    renderContacts();
}

// ── Clear add form ────────────────────────────────────────────────────
function clearAddForm() {
    document.getElementById('inp-name').value     = '';
    document.getElementById('inp-phone').value    = '';
    document.getElementById('inp-email').value    = '';
    document.getElementById('inp-address').value  = '';
    document.getElementById('inp-notes').value    = '';
    document.getElementById('inp-category').value = '';
    document.getElementById('inp-fav').checked    = false;
    document.getElementById('inp-emrg').checked   = false;
}

// ── Open edit modal ───────────────────────────────────────────────────
function openEdit(id) {
    var c = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) { c = contacts[i]; break; }
    }
    if (!c) return;

    document.getElementById('edit-id').value       = c.id;
    document.getElementById('edit-name').value     = c.name;
    document.getElementById('edit-phone').value    = c.phone;
    document.getElementById('edit-email').value    = c.email    || '';
    document.getElementById('edit-address').value  = c.address  || '';
    document.getElementById('edit-category').value = c.category || '';
    document.getElementById('edit-color').value    = c.color    || 'pink-grad';

    new bootstrap.Modal(document.getElementById('editModal')).show();
}

// ── Save edit ─────────────────────────────────────────────────────────
function saveEdit() {
    var id = parseInt(document.getElementById('edit-id').value);
    var c  = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) { c = contacts[i]; break; }
    }
    if (!c) return;

    c.name     = document.getElementById('edit-name').value.trim()  || c.name;
    c.phone    = document.getElementById('edit-phone').value.trim() || c.phone;
    c.email    = document.getElementById('edit-email').value.trim();
    c.address  = document.getElementById('edit-address').value.trim();
    c.category = document.getElementById('edit-category').value;
    c.color    = document.getElementById('edit-color').value;

    saveData();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    renderContacts();
}

// ── Init ──────────────────────────────────────────────────────────────
renderContacts();