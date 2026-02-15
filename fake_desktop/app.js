/*********************
 * Realistic Honeypot Demo (Frontend-only) — Desktop boot
 * - Opens straight into desktop (no login)
 * - Never executes real commands
 * - Logs everything locally (and optionally POST to server)
 *********************/

document.addEventListener("DOMContentLoaded", () => {
  // Show desktop immediately
  const desktopView = document.getElementById("desktopView");
  if (desktopView) desktopView.classList.remove("hidden");

  initDesktop();
});

/** ---- DOM references ---- **/
const termOut = document.getElementById("termOut");
const termCmd = document.getElementById("termCmd");
const runCmdBtn = document.getElementById("runCmd");
const promptEl = document.getElementById("prompt");

const logWindow = document.getElementById("logWindow");
const logOut = document.getElementById("logOut");
const openLogs = document.getElementById("openLogs");
const closeLogs = document.getElementById("closeLogs");
const clearLogs = document.getElementById("clearLogs");
const exportLogs = document.getElementById("exportLogs");

const sessionIdEl = document.getElementById("sessionId");
const SESSION_ID = cryptoRandomId();
if (sessionIdEl) sessionIdEl.textContent = SESSION_ID;

/** ---- Fake filesystem state ---- **/
const fs = {
  "/home/guest": ["Desktop", "Documents", "Downloads", "notes.log", "secrets.txt"],
  "/home/guest/Documents": ["report.txt", "keys.backup"],
  "/home/guest/Downloads": ["setup.bin", "readme.md"],
};
let cwd = "/home/guest";

/** ---- Command behavior ---- **/
const ALLOW_SIM = new Set([
  "help","ls","dir","whoami","pwd","cd","cat","type","echo","clear",
  "uname","id","date","ps","netstat"
]);

// Block obviously dangerous / tooling commands (still simulated, but better deterrence)
const BLOCK_PATTERNS = [
  /(^|\s)(rm|del|format|shutdown|reboot)\b/i,
  /\b(powershell|cmd\.exe|bash|\/bin\/sh)\b/i,
  /\b(curl|wget|nc|netcat|ssh|scp|nmap|msf|meterpreter)\b/i,
  />\s*\/dev\/|mkfs|dd\s+/i
];

/** ---- Desktop init ---- **/
function initDesktop(){
  safeLog("desktop_boot", { ua: navigator.userAgent });

  // Terminal events
  runCmdBtn?.addEventListener("click", () => handleCommand(termCmd.value));
  termCmd?.addEventListener("keydown", onTermKeyDown);

  // Desktop icons
  document.getElementById("openTerminal")?.addEventListener("click", () => focusTerminal());
  document.getElementById("openFiles")?.addEventListener("click", () => {
    writeOut("\n[Files] Access denied: insufficient privileges.\n");
    safeLog("fake_files_opened", {});
  });

  // Log window controls
  openLogs?.addEventListener("click", () => {
    logWindow?.classList.remove("hidden");
    safeLog("log_window_opened", {});
    renderLogs();
  });
  closeLogs?.addEventListener("click", () => logWindow?.classList.add("hidden"));
  clearLogs?.addEventListener("click", () => {
    localStorage.removeItem(storageKey());
    safeLog("logs_cleared", {});
    renderLogs();
  });
  exportLogs?.addEventListener("click", downloadLogs);

  // Draggable windows
  const terminalWindow = document.getElementById("terminalWindow");
  const dragBar = document.getElementById("dragBar");
  if (terminalWindow && dragBar) makeDraggable(terminalWindow, dragBar);

  const dragBarLogs = document.getElementById("dragBarLogs");
  if (logWindow && dragBarLogs) makeDraggable(logWindow, dragBarLogs);

  // Clock
  tickClock();
  setInterval(tickClock, 1000);

  // Terminal welcome
  writeOut("Restricted terminal session initialized.\nType 'help' for available commands.\n");
  setTimeout(() => focusTerminal(), 150);
}

/** ---- Terminal realism (history, prompt, output) ---- **/
let history = [];
let histIdx = -1;

function onTermKeyDown(e){
  if(e.key === "Enter"){
    handleCommand(termCmd.value);
    return;
  }
  if(e.key === "ArrowUp"){
    e.preventDefault();
    if(!history.length) return;
    histIdx = (histIdx <= 0) ? 0 : histIdx - 1;
    termCmd.value = history[histIdx] ?? "";
    return;
  }
  if(e.key === "ArrowDown"){
    e.preventDefault();
    if(!history.length) return;
    histIdx = (histIdx >= history.length - 1) ? history.length - 1 : histIdx + 1;
    termCmd.value = history[histIdx] ?? "";
  }
}

function updatePrompt(){
  const short = cwd.replace("/home/guest", "~");
  if (promptEl) promptEl.textContent = `guest@workstation:${short}$`;
}

function focusTerminal(){
  const w = document.getElementById("terminalWindow");
  if (w) w.style.zIndex = String(Date.now());
  updatePrompt();
  termCmd?.focus();
}

function writeOut(text){
  if (!termOut) return;
  termOut.textContent += text;
  termOut.scrollTop = termOut.scrollHeight;
}

async function handleCommand(raw){
  const cmd = (raw || "").trim();
  if(!cmd) return;

  history.push(cmd);
  histIdx = history.length;

  if (termCmd) termCmd.value = "";
  updatePrompt();

  writeOut(`\n${promptEl?.textContent ?? "guest@workstation:~$"} ${cmd}\n`);
  safeLog("terminal_command", { cmd, cwd });

  // small "processing" delay for realism
  await sleep(randInt(60, 220));

  // hard block on suspicious patterns
  if(BLOCK_PATTERNS.some(rx => rx.test(cmd))){
    writeOut("Blocked: command not permitted in this environment.\n");
    safeLog("blocked_command", { cmd, reason: "pattern_match" });
    return;
  }

  const parts = cmd.split(/\s+/);
  const base = parts[0].toLowerCase();

  if(!ALLOW_SIM.has(base)){
    writeOut(`'${base}' is not recognized. Type 'help'.\n`);
    return;
  }

  switch(base){
    case "help":
      writeOut(
        "Available: help, ls/dir, whoami, pwd, cd, cat/type, echo, clear,\n" +
        "          uname, id, date, ps, netstat\n"
      );
      break;

    case "clear":
      if (termOut) termOut.textContent = "";
      break;

    case "ls":
    case "dir": {
      const items = fs[cwd] ?? [];
      writeOut(items.length ? items.join("  ") + "\n" : "\n");
      break;
    }

    case "whoami":
      writeOut("guest\n");
      break;

    case "pwd":
      writeOut(cwd + "\n");
      break;

    case "cd": {
      const target = parts[1] || "~";
      const next = resolvePath(target);
      if(fs[next]){
        cwd = next;
        updatePrompt();
      } else {
        writeOut(`cd: no such file or directory: ${target}\n`);
      }
      break;
    }

    case "cat":
    case "type": {
      const target = parts[1] || "";
      if(!target){
        writeOut(`${base}: missing file operand\n`);
        break;
      }
      if(/secrets\.txt/i.test(target) || /keys\.backup/i.test(target)){
        writeOut("ACCESS DENIED\n");
        safeLog("attempted_sensitive_file", { target, cwd });
      } else if(/notes\.log/i.test(target)){
        writeOut("[system] routine maintenance completed\n[auth] login failures detected\n");
      } else if(/report\.txt/i.test(target)){
        writeOut("Quarterly summary: all systems nominal. (simulated)\n");
      } else {
        writeOut(`${base}: ${target}: No such file\n`);
      }
      break;
    }

    case "echo":
      writeOut(cmd.replace(/^echo\s+/i, "") + "\n");
      break;

    case "uname":
      writeOut("Linux workstation 6.1.0-hardened #1 SMP (simulated)\n");
      break;

    case "id":
      writeOut("uid=1001(guest) gid=1001(guest) groups=1001(guest)\n");
      break;

    case "date":
      writeOut(new Date().toString() + "\n");
      break;

    case "ps":
      writeOut(
        "  PID TTY      TIME CMD\n" +
        "  101 pts/0    00:00:00 shell\n" +
        "  214 pts/0    00:00:00 monitor\n"
      );
      break;

    case "netstat":
      writeOut(
        "Active Internet connections (simulated)\n" +
        "Proto Local Address      Foreign Address    State\n" +
        "tcp   10.0.0.23:22       10.0.0.1:51234     ESTABLISHED\n"
      );
      break;

    default:
      writeOut("OK\n");
  }
}

/** ---- Logging (localStorage) ---- **/
function storageKey(){
  return `honeypot_logs_${SESSION_ID}`;
}

function safeLog(event, data){
  const entry = {
    ts: new Date().toISOString(),
    session: SESSION_ID,
    event,
    data
  };

  const key = storageKey();
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(entry);
  localStorage.setItem(key, JSON.stringify(existing));

  // Optional: send to server endpoint
  // fetch("/log", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(entry) });

  console.log("[HONEYPOT]", entry);

  if(logWindow && !logWindow.classList.contains("hidden")) renderLogs();
}

function renderLogs(){
  if(!logOut) return;
  const items = JSON.parse(localStorage.getItem(storageKey()) || "[]");
  logOut.textContent = items.map(e =>
    `${e.ts}  ${e.event}  ${JSON.stringify(e.data)}`
  ).join("\n");
}

function downloadLogs(){
  const items = localStorage.getItem(storageKey()) || "[]";
  const blob = new Blob([items], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `honeypot_logs_${SESSION_ID}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  safeLog("logs_downloaded", { bytes: blob.size });
}

/** ---- Clock ---- **/
function tickClock(){
  const el = document.getElementById("clock");
  if(!el) return;
  const d = new Date();
  el.textContent = d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}

/** ---- Dragging ---- **/
function makeDraggable(winEl, handleEl){
  let startX=0, startY=0, startLeft=0, startTop=0, dragging=false;

  handleEl.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = winEl.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    winEl.style.zIndex = String(Date.now());
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    winEl.style.left = Math.max(0, startLeft + dx) + "px";
    winEl.style.top  = Math.max(0, startTop + dy) + "px";
  });

  window.addEventListener("mouseup", () => dragging=false);
}

/** ---- Helpers ---- **/
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function resolvePath(input){
  if(input === "~" || input === "") return "/home/guest";
  if(input.startsWith("/")) return input.replace(/\/+$/,"");
  if(input === ".."){
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }
  if(input === ".") return cwd;
  return (cwd + "/" + input).replace(/\/+$/,"");
}

function cryptoRandomId(){
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("");
}
