// UI Operations
function clickElement(cell) {
    cell.setAttribute("data-clicked", !checkClicked(cell));
    saveToServer();

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

function toggleHamburgerMenu(icon) {
    icon.classList.toggle("change");
    document.getElementById("main-navbar").classList.toggle("hamburger-open");
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

window.addEventListener("resize", shrinkTextToFit);

// Generating Bingo Board

async function generateNewBoard() {
    const response = await fetch("/bingo/generate_board.php", { credentials: "include" });
    const elements = await response.json();

    hideOverlay();
    updateBoardFromJSON(elements);
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

// Saving Progress

async function saveToServer() {
    try {
        const response = await fetch("/bingo/save_progress.php", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(getProgressToSave())
        });
        const result = await response.json();
        if (!result.success) console.error("Failed to save progress:", result.message);
    } catch (err) {
        console.error("Error saving progress:", err);
    }
}

function getProgressToSave() {
    const progress = {};
    progress["free"] = checkClickedFromId("free") ? "true" : "false";
    for (let i = 1; i <= 24; i++) {
        progress[i] = checkClickedFromId(i) ? "true" : "false";
    }
    return progress;
}

async function loadFromServer() {
    try {
        const result = await getSaveData();
        if (!result || !result.success) {
            return false;
        }

        updateBoardFromJSON(result.data);
        return true;

    } catch (err) {
        console.error("Error loading progress:", err);
        return false;
    }
}

async function getSaveData() {
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

async function syncGuestSaveToUserIfNeeded() {
    const user = getLoggedInUser();
    if (!user) return;

    try {
        const response = await fetch("/bingo/move_guest_save_to_user.php", { credentials: "include" });
        const result = await response.json();

        if (result.success === false) {
            console.log("Failed to move guest save to user: ", result.message);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Failed to move guest save to user:", err);
    }
    return false;
}

window.addEventListener("DOMContentLoaded", async () => {
    await checkSession();
    loadFromServer();

    const loaded = await loadFromServer();
    if (loaded) {
        hideOverlay();
    } else {
        showOverlay();
    }

    shrinkTextToFit();
});

// User Management

async function login() {
    const usernameInput = document.getElementById("email");
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

            if (!await syncGuestSaveToUserIfNeeded()) {
                    const loaded = await loadFromServer();
                    if (loaded) {
                        hideOverlay();
                    } else {
                        showOverlay();
                    }
            }
        } else {
            usernameInput.value = "";
            passwordInput.value = "";
        }
    } catch (err) {
        console.error("Login error:", err);
    }
}

async function logout() {
  try {
    await fetch("/logout.php", {
      method: "POST",
      credentials: "include"
    });

    localStorage.removeItem("loggedInUser");

    clearBingoBoardVisually();

    const loaded = await loadFromServer();
    if (loaded) {
        hideOverlay();
    } else {
        showOverlay();
    }

    shrinkTextToFit();

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
    const user = getLoggedInUser();

    if (user) {
        loginArea.innerHTML = `
        <span>Logged in as <strong>${user}</strong></span>
        <button onclick="logout()">Logout</button>
        `;
    } else {
        loginArea.innerHTML = `
        <input type="text" id="email" autofill="tmmd-email" placeholder="Email" />
        <input type="password" id="password" autofill="off" placeholder="Password" />
        <button onclick="login()">Login</button>
        <button onclick="register()">Register</button>
        <a id="login-reminder">Log in to save progress across devices</a>
        `;
    }
    if (!getLoggedInUser()) {
    const usernameInput = document.getElementById("email");
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
  updateLoginUI();
});

// End of Game

function checkWin() {
    if (checkWinHorizontal() || checkWinVertical() || checkWinDiagonal())
        return true;
}
function checkIfArrayIsClicked(selection) {
    let result = true;
    selection.forEach(element => {
        if (!checkClickedFromId(element)) result = false;
    });
    return result;
}
function checkWinHorizontal() {
    let row1 = [1,2,3,4,5];
    let row2 = [6,7,8,9,10];
    let row3 = [11,12,"free",13,14];
    let row4 = [15,16,17,18,19];
    let row5 = [20,21,22,23,24];
    if(checkIfArrayIsClicked(row1) || checkIfArrayIsClicked(row2) || checkIfArrayIsClicked(row3) || checkIfArrayIsClicked(row4) || checkIfArrayIsClicked(row5))
        return true;
    return false;
}
function checkWinVertical() {
    let column1 = [1,6,11,15,20];
    let column2 = [2,7,12,16,21];
    let column3 = [3,8,"free",17,22];
    let column4 = [4,9,13,18,23];
    let column5 = [5,10,14,19,24];
    if(checkIfArrayIsClicked(column1) || checkIfArrayIsClicked(column2) || checkIfArrayIsClicked(column3) || checkIfArrayIsClicked(column4) || checkIfArrayIsClicked(column5))
        return true;
    return false;
}
function checkWinDiagonal() {
    let diagonal1 = [1,7,"free",18,24];
    let diagonal2 = [5,9,"free",16,20];
    if (checkIfArrayIsClicked(diagonal1) || checkIfArrayIsClicked(diagonal2))
        return true;
    return false;
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

async function resetBingoBoard() {
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

    clearBingoBoardVisually();

    showOverlay();
}

function clearBingoBoardVisually() {
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
}