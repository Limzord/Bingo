const Save = Object.freeze({
    VALUES: 0,
    PROGRESS: 1,
    BOTH: 2
})
function fillBingoBoard(force = false) {
    if (!force && loadFromCookie()) {
        console.log("Loaded board from cookie!");
        return;
    }
    console.log(force ? "Forcing new board..." : "No cookie found, generating new board...");
    fetch("./bingo.json")
    .then(response => response.json())
    .then(data => {
        var usedElements = []
        for (i = 1; i <= 24; i++) {
            let randomElement;
            do {
            randomElement = data.values[Math.floor(Math.random() * data.values.length)];
            } while (usedElements.includes(randomElement));
            usedElements.push(randomElement);
            document.getElementById('bingo-'+i).innerHTML = `<div class="cell-wrapper"><span class="cell-text">${randomElement}</span></div>`;
            document.getElementById('bingo-'+i).setAttribute("data-clicked", "false");


        }
        document.getElementById('bingo-free').innerHTML = `<div class="cell-wrapper"><span class="cell-text">${data.free}</span></div>`;
        document.getElementById('bingo-free').setAttribute("data-clicked", "false");
        shrinkTextToFit();
        saveToCookie(Save.VALUES);
    });
}
function clickElement(number) {
    const cell = document.getElementById('bingo-' + number);
    cell.setAttribute("data-clicked", !checkClicked(number));
    saveToCookie(Save.PROGRESS);

    if (checkWin()) showWinScreen();
}
function checkClicked(number) {
    if (document.getElementById('bingo-'+number).getAttribute("data-clicked") == "true")
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
    if (!data) return false;

    if (data.values) {
        for (let i = 1; i <= 24; i++) {
            const text = data.values[i];
            document.getElementById('bingo-' + i).innerHTML =
                `<div class="cell-wrapper"><span class="cell-text">${text}</span></div>`;
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

    date.setDate(date.getDate() + 1);

    date.setHours(7, 0, 0, 0);

    return date.toUTCString();
}

function resetBingoBoard() {
    // clear cookie
    document.cookie = "bingoData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
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

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    // Simple simulation for now
    console.log(`Logging in as ${username}...`);

    // Save login info locally for session (later we’ll do secure server-side auth)
    localStorage.setItem("loggedInUser", username);

    updateLoginUI();
}

function logout() {
    localStorage.removeItem("loggedInUser");
    updateLoginUI();
}

function register() {
    window.location.href = "https://support.mail.tmmd.club";
}

function updateLoginUI() {
    const loginArea = document.getElementById("login-area");
    const user = localStorage.getItem("loggedInUser");

    if (user) {
        loginArea.innerHTML = `
        <span>Welcome, <strong>${user}</strong></span>
        <button onclick="logout()">Logout</button>
        `;
    } else {
        loginArea.innerHTML = `
        <input type="text" id="username" placeholder="Username" />
        <input type="password" id="password" placeholder="Password" />
        <button onclick="login()">Login</button>
        <button onclick="register()">Register</button>
        `;
    }
}

// Initialize UI on page load
window.addEventListener("load", updateLoginUI);

window.addEventListener("DOMContentLoaded", () => {
    const loaded = loadFromCookie();
    console.log("Cookie load result:", loaded);
    if (loaded) {
        hideOverlay();
    } else {
        showOverlay();
    }
    shrinkTextToFit();
});
window.addEventListener("resize", shrinkTextToFit);