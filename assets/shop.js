/* =========================
   Coin Utilities (BigInt)
========================= */
function getCoins() {
  const raw = localStorage.getItem("coins");
  try { return BigInt(raw ?? "0"); } catch { return 0n; }
}

function setCoins(amount) {
  if (typeof amount !== "bigint") amount = BigInt(amount || 0);
  if (amount < 0n) amount = 0n;
  localStorage.setItem("coins", amount.toString());
  const el = document.getElementById("coin-balance");
  if (el) el.textContent = formatBigInt(amount); // show with commas
}

function addCoins(delta) {
  if (typeof delta !== "bigint") delta = BigInt(delta || 0);
  setCoins(getCoins() + delta);
}

function loadCoins() {
  let c = getCoins();
  if (c < 0n) c = 0n;
  setCoins(c);
}

function formatBigInt(bi) {
  // 123456789n -> "123,456,789"
  const s = bi.toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* =========================
   Daily Reward
========================= */
function claimDaily() {
  const last = localStorage.getItem("lastDaily");
  const today = new Date().toDateString();
  if (last === today) {
    alert("You already claimed your daily coins today!");
    return;
  }
  addCoins(100n);
  localStorage.setItem("lastDaily", today);
  alert("+100 coins claimed!");
}

/* =========================
   Sneak Peek Purchase
========================= */
function buySneakPeek() {
  const coins = getCoins();
  if (coins < 500n) {
    alert("Not enough coins!");
    return;
  }
  if (confirm("Buy Sneak Peek for 500 coins?")) {
    setCoins(coins - 500n);

    let unlocks = [];
    try { unlocks = JSON.parse(localStorage.getItem("sidebarUnlocks")) || []; } catch {}
    if (!unlocks.includes("sneakpeek")) {
      unlocks.push("sneakpeek");
      localStorage.setItem("sidebarUnlocks", JSON.stringify(unlocks));
    }

    // Notify parent index.html to reveal the sidebar item (if implemented there)
    try { window.parent.postMessage({ type: "unlockSidebar", id: "sneakpeek" }, "*"); } catch {}

    alert("Sneak Peek unlocked! Check your sidebar.");
  }
}

/* =========================
   Gacha Spinner
========================= */
const GACHA_PRICE = 100n;
// Define rewards (edit values as you wish)
const wheelRewards = [
  { text: "+50 coins",  value:  50n },
    { text: "Nothing",    value:   0n },
  { text: "+200 coins", value: 200n },
    { text: "Nothing",    value:   0n },
  { text: "+500 coins", value: 500n },
];

let spinning = false;
let currentRotation = 0; // keep continuity between spins

function spinGacha() {
  if (spinning) return;

  const coins = getCoins();
  if (coins < GACHA_PRICE) {
    alert("Not enough coins!");
    return;
  }

  // pay first
  setCoins(coins - GACHA_PRICE);

  // pick a target slice
  const idx = Math.floor(Math.random() * wheelRewards.length);
  const slice = 360 / wheelRewards.length;
  const centerOffset = slice / 2;

  // make it exciting: 4–6 full spins plus landing on the chosen slice
  const extraSpins = 360 * (4 + Math.floor(Math.random() * 3)); // 4..6 spins
  const targetRotation = extraSpins + idx * slice + centerOffset;

  const spinner = document.getElementById("spinner");
  if (!spinner) {
    // Fallback if element missing
    finishSpin(idx);
    return;
  }

  spinning = true;
  spinner.style.transition = "transform 3.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
  currentRotation += targetRotation;
  spinner.style.transform = `rotate(${currentRotation}deg)`;

  // when animation ends -> give reward
  const onDone = () => {
    spinner.removeEventListener("transitionend", onDone);
    finishSpin(idx);
  };

  // safety timeout in case transitionend doesn't fire
  const safety = setTimeout(() => {
    spinner.removeEventListener("transitionend", onDone);
    finishSpin(idx);
  }, 3700);

  spinner.addEventListener("transitionend", () => {
    clearTimeout(safety);
    onDone();
  });
}

function finishSpin(index) {
  spinning = false;
  const reward = wheelRewards[index];
  if (reward.value > 0n) addCoins(reward.value);

  const resultEl = document.getElementById("result-text");
  const modal = document.getElementById("result-modal");
  if (resultEl && modal) {
    resultEl.textContent = `You got: ${reward.text}`;
    modal.classList.remove("hidden");
  } else {
    alert(`You got: ${reward.text}`);
  }
}

function closeResult() {
  const modal = document.getElementById("result-modal");
  if (modal) modal.classList.add("hidden");
}

/* =========================
   Redeem Codes (persisted)
========================= */
// One-time codes and their rewards
const validCodes = {
  "WELCOME100": 100n,
  "LUCKY500":   500n,
  "SECRET1000": 1000n,
  "MR_COFFEE":     1000000000000000000n // 1e18 for fun (edit/remove if you want)
};

function getUsedCodes() {
  try { return new Set(JSON.parse(localStorage.getItem("usedCodes") || "[]")); }
  catch { return new Set(); }
}

function saveUsedCodes(set) {
  localStorage.setItem("usedCodes", JSON.stringify([...set]));
}

function redeemCode() {
  const inputEl = document.getElementById("redeem-input");
  if (!inputEl) return;

  const code = inputEl.value.trim().toUpperCase();
  if (!code) return;

  const used = getUsedCodes();

  if (!(code in validCodes)) {
    alert("Invalid code!");
  } else if (used.has(code)) {
    alert("Code already used!");
  } else {
    addCoins(validCodes[code]);
    used.add(code);
    saveUsedCodes(used);
    alert(`Code redeemed! +${formatBigInt(validCodes[code])} coins`);
  }
  inputEl.value = "";
}

/* =========================
   Optional: Reset Helper
========================= */
function resetProgress() {
  if (!confirm("Reset all progress? Coins, daily, unlocks and used codes will be cleared.")) return;
  localStorage.removeItem("coins");
  localStorage.removeItem("lastDaily");
  localStorage.removeItem("sidebarUnlocks");
  localStorage.removeItem("usedCodes");
  setCoins(0n);
  alert("Progress reset!");
}

/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", loadCoins);

// Expose to window (if you’re calling from inline HTML onclick)
window.claimDaily   = claimDaily;
window.buySneakPeek = buySneakPeek;
window.spinGacha    = spinGacha;
window.closeResult  = closeResult;
window.redeemCode   = redeemCode;
window.resetProgress = resetProgress;
