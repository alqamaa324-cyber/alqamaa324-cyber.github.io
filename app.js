// Monetag Direct Ad Links (Rotating Pool)
const MONETAG_DIRECT_LINKS = [
  "https://omg10.com/4/11770859",
  "https://omg10.com/4/11771215",
  "https://omg10.com/4/11771218",
  "https://omg10.com/4/11771221"
];

let userBalance = parseInt(localStorage.getItem("userBalance")) || 0;
let currentReward = 0;
let taskStartTime = 0;
let taskCheckInterval = null;
const REQUIRED_SECONDS = 10;

function updateBalanceDisplay() {
  const headerBal = document.getElementById("header-balance");
  const walletBal = document.getElementById("wallet-balance");
  if (headerBal) headerBal.innerText = userBalance;
  if (walletBal) walletBal.innerText = userBalance;
  localStorage.setItem("userBalance", userBalance);
}

function switchTab(tabId, element) {
  document.querySelectorAll(".tab-view").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add("active");
  if (element) element.classList.add("active");
}

function claimDailyBonus() {
  const lastClaim = localStorage.getItem("lastClaimDate");
  const today = new Date().toDateString();

  if (lastClaim === today) {
    alert("Aap aaj ka Daily Reward claim kar chuke hain!");
    return;
  }

  userBalance += 10;
  localStorage.setItem("lastClaimDate", today);
  updateBalanceDisplay();
  alert("🎉 Badhai ho! +10 Coins credit ho gaye.");
}

// Android App Safe Ad Task Starter
function startAdTask(reward) {
  currentReward = reward;
  taskStartTime = Date.now();

  const overlay = document.getElementById("ad-overlay-container");
  const claimBtn = document.getElementById("ad-close-btn");
  const timerBadge = document.getElementById("ad-timer-badge");
  const countdownNum = document.getElementById("countdown-num");

  const randomIndex = Math.floor(Math.random() * MONETAG_DIRECT_LINKS.length);
  const selectedLink = MONETAG_DIRECT_LINKS[randomIndex] + "?_cb=" + Date.now();

  if (overlay) overlay.style.display = "flex";
  if (claimBtn) claimBtn.style.display = "none";
  if (timerBadge) timerBadge.style.display = "inline-block";
  if (countdownNum) countdownNum.innerText = REQUIRED_SECONDS + "s";

  // Android TWA/WebView popup safety handler
  try {
    const adWindow = window.open(selectedLink, "_blank");
    if (!adWindow || adWindow.closed || typeof adWindow.closed === "undefined") {
      window.location.href = selectedLink;
    }
  } catch (e) {
    window.location.href = selectedLink;
  }

  clearInterval(taskCheckInterval);
  taskCheckInterval = setInterval(checkAdTimeProgress, 500);
}

function checkAdTimeProgress() {
  if (!taskStartTime) return;

  const secondsPassed = Math.floor((Date.now() - taskStartTime) / 1000);
  const secondsRemaining = REQUIRED_SECONDS - secondsPassed;

  const countdownNum = document.getElementById("countdown-num");
  const timerBadge = document.getElementById("ad-timer-badge");
  const claimBtn = document.getElementById("ad-close-btn");

  if (secondsRemaining > 0) {
    if (countdownNum) countdownNum.innerText = secondsRemaining + "s";
  } else {
    clearInterval(taskCheckInterval);
    if (timerBadge) timerBadge.style.display = "none";
    if (claimBtn) claimBtn.style.display = "block";
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && taskStartTime) {
    checkAdTimeProgress();
  }
});

window.addEventListener("focus", () => {
  if (taskStartTime) {
    checkAdTimeProgress();
  }
});

function finishAndClaimReward() {
  clearInterval(taskCheckInterval);
  taskStartTime = 0;
  
  const overlay = document.getElementById("ad-overlay-container");
  if (overlay) overlay.style.display = "none";

  if (currentReward > 0) {
    userBalance += currentReward;
    updateBalanceDisplay();
    alert(`🎉 Badhai ho! +${currentReward} Coins wallet mein credit ho gaye.`);
    currentReward = 0;
  }
}

function copyReferCode() {
  const codeEl = document.getElementById("refer-code");
  const code = codeEl ? codeEl.innerText : "POCKET89";
  navigator.clipboard.writeText(code);
  alert("Referral code copy ho gaya: " + code);
}

function shareReferral() {
  const codeEl = document.getElementById("refer-code");
  const code = codeEl ? codeEl.innerText : "POCKET89";
  const text = encodeURIComponent(`Pocket Rewards app par tasks aur ads se paise kamao! Mera referral code: ${code} \nLink: ${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

let selectedCoins = 1000;
let selectedRupees = 5;

function selectAmount(coins, rupees, btn) {
  selectedCoins = coins;
  selectedRupees = rupees;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function requestPayout() {
  const upiInput = document.getElementById("upi-id");
  const upi = upiInput ? upiInput.value.trim() : "";
  
  if (!upi || !upi.includes("@")) {
    alert("Kripya sahi UPI ID enter karein (e.g. mobile@upi)");
    return;
  }

  if (userBalance < selectedCoins) {
    alert(`Insufficient balance! ₹${selectedRupees} ke liye kam se kam ${selectedCoins} coins hone chahiye.`);
    return;
  }

  userBalance -= selectedCoins;
  updateBalanceDisplay();
  alert(`Withdrawal request lag gayi hai ₹${selectedRupees} ke liye! (UPI: ${upi})`);
}

document.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();
});

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("SW Registered:", reg.scope);
      })
      .catch((err) => {
        console.log("SW Fail:", err);
      });
  });
}
