// ====== SLIDER ======
let slides = document.querySelectorAll('.slide');
let dots = document.querySelectorAll('.dot');
let index = 0;

function showSlide(i) {
  slides.forEach((slide, n) => {
    slide.classList.toggle('active', n === i);
    dots[n].classList.toggle('active', n === i);
  });
  index = i;
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => showSlide(i));
});

setInterval(() => {
  index = (index + 1) % slides.length;
  showSlide(index);
}, 5000); // Auto slide every 5s

// ====== MOBILE MENU ======
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
  navbar.style.display = navbar.style.display === "block" ? "none" : "block";
});


// Counter Animation
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    const updateCounter = () => {
      const target = +counter.getAttribute("data-target");
      const current = +counter.innerText;
      const increment = target / 100; // adjust speed

      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCounter, 20);
      } else {
        counter.innerText = target;
      }
    };

    updateCounter();
  });
});

// /assets/js/script.js
// Tastyc — Simple client-side auth (signup/login) with SHA-256 password hashing.
// Demo only: NOT secure for production (no server-side auth).

(async () => {
  // ---------- Utilities ----------
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const body = document.body;

  async function hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function saveUsers(users) {
    localStorage.setItem('tastyc_users', JSON.stringify(users));
  }
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem('tastyc_users') || '[]');
    } catch {
      return [];
    }
  }
  function setCurrentUser(email) {
    localStorage.setItem('tastyc_current', email);
  }
  function getCurrentUser() {
    return localStorage.getItem('tastyc_current');
  }
  function clearCurrentUser() {
    localStorage.removeItem('tastyc_current');
  }

  // ---------- Inject overlay HTML + styles ----------
  const style = document.createElement('style');
  style.textContent = `
  /* Auth overlay styles (injected) */
  #auth-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,10,10,0.95);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  #auth-card {
    width: 100%;
    max-width: 920px;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    min-height: 520px;
  }
  #auth-left {
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  #auth-left h2 { margin: 0 0 6px; font-family: 'Poppins', sans-serif; }
  #auth-left p { margin: 0 0 18px; color: #555; }
  #auth-forms { flex: 1; display:flex; align-items:flex-start; }
  .auth-form { width:100%; max-width:380px; }
  .auth-form input[type="text"], .auth-form input[type="email"], .auth-form input[type="password"] {
    width:100%; padding:10px 12px; margin-bottom:10px; border-radius:6px; border:1px solid #ddd; font-size:14px;
  }
  .auth-btn { display:inline-block; padding:10px 16px; border-radius:6px; background:#ff7a18; color:#fff; border:none; cursor:pointer; font-weight:600; }
  .link-btn { background:transparent; color:#ff7a18; border:1px solid #ff7a18; padding:8px 12px; border-radius:6px; cursor:pointer; }
  .auth-footer { margin-top:8px; color:#777; font-size:13px; }
  .auth-error { color:#b00020; margin:8px 0; font-size:13px; }
  #auth-right {
    background-image: url('/assets/images/banner-1.jpg');
    background-size: cover;
    background-position: center;
    min-height: 100%;
  }
  #auth-quick { padding: 18px 36px; }
  #auth-quick h3 { margin-top:0; }
  #logout-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 12px 25px;
    border-radius: 6px;
    cursor: pointer;
    font-weight:600;
  }
  @media (max-width: 880px) {
    #auth-card { grid-template-columns: 1fr; min-height: 0; }
    #auth-right { display:none; }
  }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.innerHTML = `
  <div id="auth-card" role="dialog" aria-modal="true" aria-label="Authentication required">
    <div id="auth-left">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2>Tastyc — Sign in to continue</h2>
          <p>Welcome! Please login or sign up to access the website.</p>
        </div>
      </div>

      <div id="auth-forms">
        <div style="width:100%;">
          <!-- LOGIN form -->
          <form id="login-form" class="auth-form" autocomplete="on" style="display:block;">
            <input type="email" id="login-email" placeholder="Email" required />
            <input type="password" id="login-password" placeholder="Password" required />
            <div class="auth-error" id="login-error" aria-live="polite"></div>
            <button type="submit" class="auth-btn">Login</button>
            <div class="auth-footer">Don't have an account? <button type="button" id="show-signup" class="link-btn">Sign up</button></div>
          </form>

          <!-- SIGNUP form -->
          <form id="signup-form" class="auth-form" autocomplete="on" style="display:none;">
            <input type="text" id="signup-name" placeholder="Full name" required />
            <input type="email" id="signup-email" placeholder="Email" required />
            <input type="password" id="signup-password" placeholder="Password (min 6 chars)" required />
            <div class="auth-error" id="signup-error" aria-live="polite"></div>
            <button type="submit" class="auth-btn">Create account</button>
            <div class="auth-footer">Already registered? <button type="button" id="show-login" class="link-btn">Login</button></div>
          </form>
        </div>
      </div>

      <div style="margin-top:auto; font-size:13px; color:#666;">
        <p style="margin:0 0 6px;">Why sign up?</p>
        <ul style="margin:8px 0 0 18px; color:#666;">
          <li>Access the full website</li>
          <li>Save favourites (future)</li>
        </ul>
      </div>
    </div>

    <div id="auth-right" aria-hidden="true">
      <!-- decorative right panel -->
    </div>
  </div>
  `;
  document.body.appendChild(overlay);

  // ---------- Block page interaction while overlay visible ----------
  function lockPage() {
    body.style.overflow = 'hidden';
  }
  function unlockPage() {
    body.style.overflow = '';
  }

  // ---------- Header logout button (added dynamically) ----------
  function ensureLogoutButton() {
    // If already exists, skip
    if (qs('#logout-btn')) return;

    const header = qs('header .container.header-container') || qs('header') || document.body;
    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'logout-btn';
    btn.textContent = 'Logout';
    btn.style.marginLeft = '12px';
    btn.addEventListener('click', () => {
      clearCurrentUser();
      showOverlay();
    });

    // append to header container at end
    header.appendChild(btn);
  }
  function showLogoutIfNeeded() {
    const cur = getCurrentUser();
    const btn = qs('#logout-btn');
    if (cur) {
      if (!btn) ensureLogoutButton();
      else btn.style.display = 'inline-block';
    } else {
      if (btn) btn.style.display = 'none';
    }
  }

  // ---------- Show/hide overlay ----------
  function showOverlay() {
    overlay.style.display = 'flex';
    lockPage();
  }
  function hideOverlay() {
    overlay.style.display = 'none';
    unlockPage();
  }

  // ---------- Form behavior ----------
  const loginForm = qs('#login-form');
  const signupForm = qs('#signup-form');
  const showSignupBtn = qs('#show-signup');
  const showLoginBtn = qs('#show-login');
  const loginError = qs('#login-error');
  const signupError = qs('#signup-error');

  showSignupBtn.addEventListener('click', e => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    loginError.textContent = '';
    signupError.textContent = '';
  });
  showLoginBtn.addEventListener('click', e => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginError.textContent = '';
    signupError.textContent = '';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = qs('#login-email').value.trim().toLowerCase();
    const pass = qs('#login-password').value || '';
    if (!email || !pass) {
      loginError.textContent = 'Please fill both fields.';
      return;
    }
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      loginError.textContent = 'No account found. Please sign up first.';
      return;
    }
    const h = await hashPassword(pass);
    if (h !== user.passwordHash) {
      loginError.textContent = 'Incorrect credentials. Please try again.';
      return;
    }
    // success
    setCurrentUser(email);
    hideOverlay();
    showLogoutIfNeeded();
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.textContent = '';
    const name = qs('#signup-name').value.trim();
    const email = qs('#signup-email').value.trim().toLowerCase();
    const pass = qs('#signup-password').value || '';
    if (!name || !email || !pass) {
      signupError.textContent = 'Please fill all fields.';
      return;
    }
    if (pass.length < 6) {
      signupError.textContent = 'Password should be at least 6 characters.';
      return;
    }
    // basic email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      signupError.textContent = 'Please enter a valid email address.';
      return;
    }
    const users = loadUsers();
    if (users.some(u => u.email === email)) {
      signupError.textContent = 'An account with this email already exists. Please login.';
      return;
    }
    const h = await hashPassword(pass);
    users.push({ name, email, passwordHash: h, createdAt: new Date().toISOString() });
    saveUsers(users);
    // auto-login after signup
    setCurrentUser(email);
    hideOverlay();
    showLogoutIfNeeded();
  });

  // ---------- Initial check: if not logged in, show overlay ----------
  function init() {
    const cur = getCurrentUser();
    if (!cur) {
      showOverlay();
    } else {
      hideOverlay();
    }
    showLogoutIfNeeded();
    // Make sure overlay remains until user logs in. If the overlay is present, lock page.
    if (overlay.style.display === 'flex') lockPage();
  }

  // run init
  init();

  // ---------- Accessibility: keep focus inside overlay when open ----------
  // simple trap
  document.addEventListener('focus', (ev) => {
    if (overlay.style.display === 'flex' && !overlay.contains(ev.target)) {
      ev.stopPropagation();
      const firstInput = overlay.querySelector('input, button');
      if (firstInput) firstInput.focus();
    }
  }, true);

  // Optional: expose functions in window for debugging (remove in production)
  window.tastycAuth = {
    getUsers: loadUsers,
    currentUser: getCurrentUser,
    logout: () => { clearCurrentUser(); showOverlay(); },
    hideOverlayForTesting: () => hideOverlay(),
  };

})();

const ADMIN_EMAIL = 'admin@tastyc.com';

function isAdmin() {
    return getCurrentUser() === ADMIN_EMAIL;
}

if (getCurrentUser()) {
    if (isAdmin()) {
        // Redirect admin to admin page
        window.location.href = '/admin.html';
    } else {
        // Normal user stays on homepage
        hideOverlay();
    }
}
