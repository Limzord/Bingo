const Save = Object.freeze({
    VALUES: 0,
    PROGRESS: 1,
    BOTH: 2
})
function fillBingoBoard(force = false) {
    if (!force && loadProgress()) {
        console.log("Loaded board from cookie!");
        return;
    }
    console.log(force ? "Forcing new board..." : "No cookie found, generating new board...");
    fetch("./bingo.json")
    .then(response => response.json())
    .then(data => {
        var elements = { "values":{}, "progress":{} }
        elements["values"]["free"] = data.free[Math.floor(Math.random() * data.free.length)];
        elements["progress"]["free"] = "false";
        for (let i = 1; i <= 24; i++) {
            let randomElement;
            do {
            randomElement = data.values[Math.floor(Math.random() * data.values.length)];
            } while (Object.values(elements["values"]).includes(randomElement));
            elements["values"][i] = randomElement;
            elements["progress"][i] = "false";
        }
        updateBoardFromJSON(elements);
        saveProgress(Save.VALUES);
    });
}
function clickElement(cell) {
    cell.setAttribute("data-clicked", !checkClicked(cell));
    saveProgress(Save.BOTH);

    if (checkWin()) showWinScreen();
}
function checkClicked(cell) {
    if (cell.getAttribute("data-clicked") == "true")
        return true;
    return false;
}
function checkWin() {
    if (checkWinHorizontal() || checkWinVertical() || checkWinDiagonal())
        return true;
}
function checkWinHorizontal() {
    if (checkClicked(1) && checkClicked(2) && checkClicked(3) && checkClicked(4) && checkClicked(5))
        return true;
    else if (checkClicked(6) && checkClicked(7) && checkClicked(8) && checkClicked(9) && checkClicked(10))
        return true;
    else if (checkClicked(11) && checkClicked(12) && checkClicked("free") && checkClicked(13) && checkClicked(14))
        return true;
    else if (checkClicked(15) && checkClicked(16) && checkClicked(17) && checkClicked(18) && checkClicked(19))
        return true;
    else if (checkClicked(20) && checkClicked(21) && checkClicked(22) && checkClicked(23) && checkClicked(24))
        return true;
}
function checkWinVertical() {
    if (checkClicked(1) && checkClicked(6) && checkClicked(11) && checkClicked(15) && checkClicked(20))
        return true;
    else if (checkClicked(2) && checkClicked(7) && checkClicked(12) && checkClicked(16) && checkClicked(21))
        return true;
    else if (checkClicked(3) && checkClicked(8) && checkClicked("free") && checkClicked(17) && checkClicked(22))
        return true;
    else if (checkClicked(4) && checkClicked(9) && checkClicked(13) && checkClicked(18) && checkClicked(23))
        return true;
    else if (checkClicked(5) && checkClicked(10) && checkClicked(14) && checkClicked(19) && checkClicked(24))
        return true;
}
function checkWinDiagonal() {
    if (checkClicked(1) && checkClicked(7) && checkClicked("free") && checkClicked(18) && checkClicked(24))
        return true;
    else if (checkClicked(5) && checkClicked(9) && checkClicked("free") && checkClicked(16) && checkClicked(20))
        return true;
}

function saveToCookie(type) {
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
    progress["free"] = checkClicked("free") ? "true" : "false";
    for (let i = 1; i <= 24; i++) {
        progress[i] = checkClicked(i) ? "true" : "false";
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

    if (date.getHours() >= 7) {
        date.setDate(date.getDate() + 1);
    }

    date.setHours(7, 0, 0, 0);

    return date.toUTCString();
}

async function resetBingoBoard() {
    // clear cookie
    document.cookie = "bingoData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    const user = getLoggedInUser();  

    if (user) {
        try {
            const response = await fetch("/reset_progress.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            const result = await response.json();
            if (!result.success) console.error("Failed to reset progress:", result.message);
        } catch (err) {
            console.error("Error resetting progress:", err);
        }
    }
    
    // clear current board visually (optional)
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

    // Show overlay again
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
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // store the display name from /etc/passwd
            localStorage.setItem("loggedInUser", data.user);
            updateLoginUI();

            hideOverlay();

            await syncCookieToServerIfNeeded();
        } else {
            // failed login: clear input and optionally show message
            usernameInput.value = "";
            passwordInput.value = "";
            // alert(data.message || "Login failed");
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
    await fetch("https://tmmd.club/logout.php", {
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
        const res = await fetch("/refresh_session.php", {
            credentials: "include"
        });
        const data = await res.json();

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

async function saveProgress(type = Save.BOTH) {
    const user = localStorage.getItem("loggedInUser");

    const data = {};
    if (type === Save.VALUES || type === Save.BOTH) data.values = getValuesToSave();
    if (type === Save.PROGRESS || type === Save.BOTH) data.progress = getProgressToSave();

    if (user) {
        try {
            const response = await fetch("/save_progress.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!result.success) console.error("Failed to save progress:", result.message);
        } catch (err) {
            console.error("Error saving progress:", err);
        }

        // Clear old cookie once server save succeeds
        document.cookie = "bingoData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
        // Not logged in: fallback to cookie
        saveToCookie(type);
    }
}

async function syncCookieToServerIfNeeded() {
    const user = getLoggedInUser();
    if (!user) return;

    try {
        const resp = await fetch("/load_progress.php", { credentials: "include" });
        const data = await resp.json();

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
        // Logged in: load from server
        try {
            const response = await fetch("/load_progress.php", {
                method: "GET",
                credentials: "include"
            });
            const result = await response.json();
            if (!result.success) {
                console.log("No save for this user yet");
                return false;
            }

            updateBoardFromJSON(result.data);
            return true;

        } catch (err) {
            console.error("Error loading progress:", err);
            return false;
        }
    } else {
        // Not logged in: load from cookie
        return loadFromCookie();
    }
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