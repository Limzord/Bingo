const Save = Object.freeze({
    VALUES: 0,
    PROGRESS: 1,
    BOTH: 2
})
function fillBingoBoard() {
    if(document.cookie) {

    }
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
            document.getElementById('bingo-'+i).innerHTML = randomElement;


        }
        document.getElementById('bingo-free').innerHTML = data.free;
    });
}
function clickElement(number) {
    if (checkClicked(number)) {
        document.getElementById('bingo-'+number).setAttribute("data-clicked", false);
    } else {
        document.getElementById('bingo-'+number).setAttribute("data-clicked", true);
    }
    if (checkWin()) {
        showWinScreen();
    }
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
    var cookie;
    if (type == Save.VALUES)
        cookie = getValuesToCookie();
    else if (type == Save.PROGRESS)
        cookie = getProgressToCookie();
    else if (type == Save.BOTH) {
        cookie = getValuesToCookie();
        cookie = cookie + getProgressToCookie();
    }
    let expiryDate = getCookieExpiryDate();
    cookie = cookie + "expires="+expiryDate+";"
    document.cookie = cookie;
}
function getValuesToCookie() {
    var cookie;
    cookie = cookie + "valueFree="+document.getElementById('bingo-free').innerHTML+"; ";
    for (i = 1; i <= 24; i++) {
        cookie = cookie + "value"+i+"="+document.getElementById('bingo-'+i).innerHTML+"; ";
    }
    return cookie;
}
function getProgressToCookie() {
    var cookie;
    cookie = cookie + "progressFree="+checkClicked("free")+"; ";
    for (i = 1; i <= 24; i++) {
        cookie = cookie + "progress"+i+"="+checkClicked(i)+"; ";
    }
    return cookie;
}

function getCookieExpiryDate() {
    const date = new Date();

    date.setDate(date.getDate() + 1);

    date.setHours(7, 0, 0, 0);

    return date.toUTCString();
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