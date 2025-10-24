const Save = Object.freeze({
    VALUES: 0,
    PROGRESS: 1,
    BOTH: 2
})
async function fillBingoBoard(force = false) {
    if (!force && loadProgress()) {
        // console.log("Loaded board from cookie / account!");
        return;
    }
    console.log(force ? "Forcing new board..." : "No save data found, generating new board...");

    const response = await fetch("/bingo/generate_board.php", { credentials: "include" });
    const elements = await response.json();

    updateBoardFromJSON(elements);
    saveProgress(Save.VALUES);
}
function clickElement(cell) {
    cell.setAttribute("data-clicked", !checkClicked(cell));
    saveProgress(Save.PROGRESS);

    if (checkWin()) showWinScreen();
}
function checkClicked(cell) {
    if (cell.getAttribute("data-clicked") == "true")
        return true;
    return false;
}
function checkClickedFromId(number) {
    const cell = document.getElementById('bingo-' + number);
    return checkClicked(cell);
}
function checkWin() {
    if (checkWinHorizontal() || checkWinVertical() || checkWinDiagonal())
        return true;
}
function checkWinHorizontal() {
    if (checkClickedFromId(1) && checkClickedFromId(2) && checkClickedFromId(3) && checkClickedFromId(4) && checkClickedFromId(5))
        return true;
    else if (checkClickedFromId(6) && checkClickedFromId(7) && checkClickedFromId(8) && checkClickedFromId(9) && checkClickedFromId(10))
        return true;
    else if (checkClickedFromId(11) && checkClickedFromId(12) && checkClickedFromId("free") && checkClickedFromId(13) && checkClickedFromId(14))
        return true;
    else if (checkClickedFromId(15) && checkClickedFromId(16) && checkClickedFromId(17) && checkClickedFromId(18) && checkClickedFromId(19))
        return true;
    else if (checkClickedFromId(20) && checkClickedFromId(21) && checkClickedFromId(22) && checkClickedFromId(23) && checkClickedFromId(24))
        return true;
}
function checkWinVertical() {
    if (checkClickedFromId(1) && checkClickedFromId(6) && checkClickedFromId(11) && checkClickedFromId(15) && checkClickedFromId(20))
        return true;
    else if (checkClickedFromId(2) && checkClickedFromId(7) && checkClickedFromId(12) && checkClickedFromId(16) && checkClickedFromId(21))
        return true;
    else if (checkClickedFromId(3) && checkClickedFromId(8) && checkClickedFromId("free") && checkClickedFromId(17) && checkClickedFromId(22))
        return true;
    else if (checkClickedFromId(4) && checkClickedFromId(9) && checkClickedFromId(13) && checkClickedFromId(18) && checkClickedFromId(23))
        return true;
    else if (checkClickedFromId(5) && checkClickedFromId(10) && checkClickedFromId(14) && checkClickedFromId(19) && checkClickedFromId(24))
        return true;
}
function checkWinDiagonal() {
    if (checkClickedFromId(1) && checkClickedFromId(7) && checkClickedFromId("free") && checkClickedFromId(18) && checkClickedFromId(24))
        return true;
    else if (checkClickedFromId(5) && checkClickedFromId(9) && checkClickedFromId("free") && checkClickedFromId(16) && checkClickedFromId(20))
        return true;
}

function saveToCookie(type = Save.PROGRESS) {
    // Load current cookie (if any)
    let existing = loadCookieData() || {};

    if (type == Save.VALUES || type == Save.BOTH) {
        existing.values = getValuesToSave();
    }
    if (type == Save.PROGRESS || type == Save.BOTH) {
        existing.progress = getProgressToSave();
    }

    const expiryDate = getCookieExpiryDate();
    document.cookie = "bingoData=" + encodeURIComponent(JSON.stringify(existing)) + "; expires=" + expiryDate + "; path=/";
}

function getValuesToSave() {
    const values = {};
    values["free"] = document.querySelector('#bingo-free .cell-text').textContent;
    for (let i = 1; i <= 24; i++) {
        values[i] = document.querySelector(`#bingo-${i} .cell-text`).textContent;
    }
    return values;
}

function getProgressToSave() {
    const progress = {};
    progress["free"] = checkClickedFromId("free") ? "true" : "false";
    for (let i = 1; i <= 24; i++) {
        progress[i] = checkClickedFromId(i) ? "true" : "false";
    }
    return progress;
}

function loadFromCookie() {
    const data = loadCookieData();
    if (updateBoardFromJSON(data))
        return true;
    return false;
}

function loadCookieData() {
    const cookie = document.cookie.split("; ").find(row => row.startsWith("bingoData="));
    if (!cookie) return null;
    try {
        return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    } catch (e) {
        console.error("Error parsing cookie:", e);
        return null;
    }
}

function getCookieExpiryDate() {
    const date = new Date();

    if (date.getHours() >= 9) {
        date.setDate(date.getDate() + 1);
    }

    date.setHours(9, 0, 0, 0);

    return date.toUTCString();
}

async function resetBingoBoard() {
    // clear cookie
    document.cookie = "bingoData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    const user = getLoggedInUser();  

    if (user) {
        try {
            const response = await fetch("/bingo/reset_progress.php", {
                method: "POST",
                credentials: "include"
            });
            const result = await response.json();
            if (!result.success) console.error("Failed to reset progress:", result.message);
        } catch (err) {
            console.error("Error resetting progress:", err);
        }
    }

    for (let i = 1; i <= 24; i++) {
        const cell = document.getElementById('bingo-' + i);
        if (cell) {
            cell.innerHTML = '';
            cell.removeAttribute("data-clicked");
        }
    }
    const free = document.getElementById('bingo-free');
    if (free) {
        free.innerHTML = '';
        free.removeAttribute("data-clicked");
    }

    showOverlay();
}

function showWinScreen() {
    document.getElementById("winScreen").style.height = "100%";
    throwConfetti();
}

function hideWinScreen() {
    document.getElementById("winScreen").style.height = "0%";
    stopConfetti();
}

var confettiOn;

function throwConfetti() {
confettiOn = true;

    (function frame() {
        confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        });
        confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        });

        if (confettiOn) {
        requestAnimationFrame(frame);
        }
    })();
}
function stopConfetti() {
    confettiOn = false;
}

function shrinkTextToFit() {
    document.querySelectorAll('.cell-text').forEach(span => {
        const container = span.parentElement;
        let fontSize = 10 * Math.min(window.innerWidth, window.innerHeight) / 100;
        span.style.fontSize = fontSize + "px";

        const errorTolerance = 6;

        while ((span.scrollHeight > container.clientHeight -errorTolerance || span.scrollWidth > container.clientWidth - errorTolerance) && fontSize > 5) {
        fontSize--;
        span.style.fontSize = fontSize + "px";
        }
    });
}

function showOverlay() {
    document.getElementById('start-overlay').style.display = 'flex';
}

function hideOverlay() {
    document.getElementById('start-overlay').style.display = 'none';
}

function openPopup() {
    document.getElementById('resetPopup').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('resetPopup').classList.add('hidden');
}

function confirmReset() {
    closePopup();
    resetBingoBoard();
}

// === Bingo Reset + Generation ===
function generateNewBoard() {
    hideOverlay();
    fillBingoBoard(true);
}

async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) return;

    try {
        const response = await fetch("/login.php", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("loggedInUser", data.user);
            updateLoginUI();

            hideOverlay();

            await syncCookieToServerIfNeeded();
        } else {
            usernameInput.value = "";
            passwordInput.value = "";
        }
    } catch (err) {
        console.error("Login error:", err);
    }
}

function getLoggedInUser() {
  return localStorage.getItem("loggedInUser");
}

window.addEventListener("load", () => {
  const user = getLoggedInUser();
  if (user) {
    console.log("Welcome back, " + user);
  } else {
    console.log("Not logged in");
  }
});

async function logout() {
  try {
    await fetch("/logout.php", {
      method: "POST",
      credentials: "include"
    });

    localStorage.removeItem("loggedInUser");

    document.cookie = "loggedInUser=; path=/; domain=tmmd.club; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    updateLoginUI();
  } catch (err) {
    console.error("Logout error:", err);
    alert("Error logging out. Please try again.");
  }
}

function register() {
    window.location.href = "https://support.mail.tmmd.club";
}

async function checkSession() {
    try {
        const response = await fetch("/refresh_session.php", {
            credentials: "include"
        });
        const data = await response.json();

        if (data.logged_in) {
            localStorage.setItem("loggedInUser", data.user);
        } else {
            localStorage.removeItem("loggedInUser");
        }

        updateLoginUI();
    } catch (err) {
        console.error("Session check failed:", err);
    }
}

function updateLoginUI() {
    const loginArea = document.getElementById("login-area");
    const user = localStorage.getItem("loggedInUser");

    if (user) {
        loginArea.innerHTML = `
        <span>Logged in as <strong>${user}</strong></span>
        <button onclick="logout()">Logout</button>
        `;
    } else {
        loginArea.innerHTML = `
        <input type="text" id="username" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button onclick="login()">Login</button>
        <button onclick="register()">Register</button>
        <a id="login-reminder">Log in to save progress across devices</a>
        `;
    }
    if (!localStorage.getItem("loggedInUser")) {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            login();
        }
        });
    });
    }
}

function toggleHamburgerMenu(icon) {
    icon.classList.toggle("change");
    document.getElementById("main-navbar").classList.toggle("hamburger-open");
}

window.addEventListener("load", updateLoginUI);

window.addEventListener("DOMContentLoaded", async () => {
    await checkSession();
    fillBingoBoard(false);

    const loaded = await loadProgress();
    if (loaded) {
        hideOverlay();
    } else {
        showOverlay();
    }

    shrinkTextToFit();
});
window.addEventListener("resize", shrinkTextToFit);

async function saveProgress(type = Save.PROGRESS) {
    const user = localStorage.getItem("loggedInUser");
    
    if (user) {
        saveToUser(type, user);
    } else {
        saveToCookie(type);
    }
}

async function saveToUser(type = Save.PROGRESS, user) {
    let existing = await getUserData() || {};
    if (existing.data) {
        existing = existing.data;
    }
    if (type === Save.VALUES || type === Save.BOTH) existing.values = getValuesToSave();
    if (type === Save.PROGRESS || type === Save.BOTH) existing.progress = getProgressToSave();

    try {
        const response = await fetch("/bingo/save_progress.php", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(existing)
        });
        const result = await response.json();
        if (!result.success) console.error("Failed to save progress:", result.message);
    } catch (err) {
        console.error("Error saving progress:", err);
    }
}

async function syncCookieToServerIfNeeded() {
    const user = getLoggedInUser();
    if (!user) return;

    try {
        const response = await fetch("/bingo/load_progress.php", { credentials: "include" });
        const data = await response.json();

        if (data.success === false) {
            const cookieData = loadCookieData();
            if (cookieData) {
                await saveProgress(Save.BOTH);
            }
        } else {
            updateBoardFromJSON(data.data);
        }
    } catch (err) {
        console.error("Failed to sync cookie to server:", err);
    }
}

async function loadProgress() {
    const user = getLoggedInUser();  

    if (user) {
        try {
            const result = await getUserData();
            if (!result.success) {
                return false;
            }

            updateBoardFromJSON(result.data);
            return true;

        } catch (err) {
            console.error("Error loading progress:", err);
            return false;
        }
    } else {
        return loadFromCookie();
    }
}

async function getUserData() {
    const response = await fetch("/bingo/load_progress.php", {
        method: "GET",
        credentials: "include"
    });
    const result = await response.json();
        if (!result.success) {
            console.log("No save for this user yet");
            return null;
        }
    return result;
}

function updateBoardFromJSON(data) {
    if (!data) return false;

    if (data.values) {
        for (let i = 1; i <= 24; i++) {
            document.getElementById('bingo-' + i).innerHTML =
                `<div class="cell-wrapper"><span class="cell-text">${data.values[i]}</span></div>`;
        }
        if (data.values.free) {
            document.getElementById('bingo-free').innerHTML =
                `<div class="cell-wrapper"><span class="cell-text">${data.values.free}</span></div>`;
        }
    }

    if (data.progress) {
        for (let i = 1; i <= 24; i++) {
            document.getElementById('bingo-' + i)
                .setAttribute("data-clicked", data.progress[i] === "true" ? "true" : "false");
        }
        document.getElementById('bingo-free')
            .setAttribute("data-clicked", data.progress.free === "true" ? "true" : "false");
    }

    shrinkTextToFit();
    return true;
}