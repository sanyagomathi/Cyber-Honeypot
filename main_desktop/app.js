/*********************
 * "Real desktop" simulation (browser)
 * - Logs every action from the fake desktop
 * - Download Logs exports REAL captured logs (JSON)
 * - Safe: never executes real commands
 *********************/

document.addEventListener("DOMContentLoaded", () => boot());

const SESSION_ID = cryptoRandomId();
const LOG_KEY = `honeypot_desktop_logs_${SESSION_ID}`;

// --- DOM ---
const sessionIdEl = document.getElementById("sessionId");

const clockEl = document.getElementById("clock");
const clock2El = document.getElementById("clock2");

const startBtn = document.getElementById("startBtn");
const startMenu = document.getElementById("startMenu");

const winTerminal = document.getElementById("winTerminal");
const winFiles = document.getElementById("winFiles");
const winLogs = document.getElementById("winLogs");

const dragTerminal = document.getElementById("dragTerminal");
const dragFiles = document.getElementById("dragFiles");
const dragLogs = document.getElementById("dragLogs");

const closeTerminal = document.getElementById("closeTerminal");
const closeFiles = document.getElementById("closeFiles");
const closeLogs = document.getElementById("closeLogs");

const iconTerminal = document.getElementById("iconTerminal");
const iconFiles = document.getElementById("iconFiles");
const iconLogs = document.getElementById("iconLogs");

const taskTerminal = document.getElementById("taskTerminal");
const taskFiles = document.getElementById("taskFiles");
const taskLogs = document.getElementById("taskLogs");

const startTerminal = document.getElementById("startTerminal");
const startFiles = document.getElementById("startFiles");
const startLogs = document.getElementById("startLogs");

const downloadLogsTop = document.getElementById("downloadLogsTop");
const downloadLogsStart = document.getElementById("downloadLogsStart");
const downloadLogsTray = document.getElementById("downloadLogsTray");
const downloadLogsBtn = document.getElementById("downloadLogs");
const clearLogsBtn = document.getElementById("clearLogs");

const logOut = document.getElementById("logOut");

// Terminal
const termOut = document.getElementById("termOut");
const termCmd = document.getElementById("termCmd");
const runCmd = document.getElementById("runCmd");
const promptEl = document.getElementById("prompt");

// Files
const fileList = document.getElementById("fileList");
const filePreview = document.getElementById("filePreview");
const pathBar = document.getElementById("pathBar");

// Fake FS
const fs = {
  "/home/guest": ["Desktop", "Documents", "Downloads", "notes.log", "secrets.txt"],
  "/home/guest/Documents": ["report.txt", "keys.backup"],
  "/home/guest/Downloads": ["setup.bin", "readme.md"],
};
let cwd = "/home/guest";

// Terminal behavior
const ALLOW_SIM = new Set([
  "help","ls","dir","whoami","pwd","cd","cat","type","echo","clear",
  "uname","id","date","ps","netstat"
]);

const BLOCK_PATTERNS = [
  /(^|\s)(rm|del|format|shutdown|reboot)\b/i,
  /\b(powershell|cmd\.exe|bash|\/bin\/sh)\b/i,
  /\b(curl|wget|nc|netcat|ssh|scp|nmap|msf|meterpreter)\b/i,
  />\s*\/dev\/|mkfs|dd\s+/i
];

let history = [];
let histIdx = -1;

function boot(){
  sessionIdEl.textContent = SESSION_ID;

  // First log: session start
  safeLog("session_start", { ua: navigator.userAgent });

  // Clock
  tickClock();
  setInterval(tickClock, 1000);

  // Draggable windows
  makeDraggable(winTerminal, dragTerminal);
  makeDraggable(winFiles, dragFiles);
  makeDraggable(winLogs, dragLogs);

  // Window focus on click
  [winTerminal, winFiles, winLogs].forEach(w => {
    w.addEventListener("mousedown", () => bringToFront(w));
  });

  // Start menu
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleStart();
  });

  document.addEventListener("click", (e) => {
    // click outside closes start menu
    if(!startMenu.classList.contains("hidden")) startMenu.classList.add("hidden");
  });

  // Open apps (icons, taskbar, start)
  wireOpeners();

  // Close buttons
  closeTerminal.addEventListener("click", () => closeApp("terminal"));
  closeFiles.addEventListener("click", () => closeApp("files"));
  closeLogs.addEventListener("click", () => closeApp("logs"));

  // Logs controls
  clearLogsBtn.addEventListener("click", () => {
    localStorage.removeItem(LOG_KEY);
    safeLog("logs_cleared", {});
    renderLogs();
  });

  [downloadLogsTop, downloadLogsStart, downloadLogsTray, downloadLogsBtn]
    .forEach(btn => btn.addEventListener("click", () => downloadLogs()));

  // Terminal wiring
  runCmd.addEventListener("click", () => handleCommand(termCmd.value));
  termCmd.addEventListener("keydown", onTermKeyDown);

  // Files wiring
  document.querySelectorAll(".side-item").forEach(btn => {
    btn.addEventListener("click", () => openFolder(btn.dataset.path));
  });

  // Initial UI state
  openApp("terminal", { reason: "boot" });
  openFolder("/home/guest");
  renderLogs();

  // Terminal greeting
  writeTerm("Restricted terminal session initialized.\nType 'help' for available commands.\n");
  focusTerminal();
}

function wireOpeners(){
  // Desktop icons
  iconTerminal.addEventListener("dblclick", () => openApp("terminal", { source:"desktop_icon" }));
  iconFiles.addEventListener("dblclick", () => openApp("files", { source:"desktop_icon" }));
  iconLogs.addEventListener("dblclick", () => openApp("logs", { source:"desktop_icon" }));

  // Single click also works
  iconTerminal.addEventListener("click", () => openApp("terminal", { source:"desktop_icon" }));
  iconFiles.addEventListener("click", () => openApp("files", { source:"desktop_icon" }));
  iconLogs.addEventListener("click", () => openApp("logs", { source:"desktop_icon" }));

  // Taskbar
  taskTerminal.addEventListener("click", () => openApp("terminal", { source:"taskbar" }));
  taskFiles.addEventListener("click", () => openApp("files", { source:"taskbar" }));
  taskLogs.addEventListener("click", () => openApp("logs", { source:"taskbar" }));

  // Start menu
  startTerminal.addEventListener("click", () => { openApp("terminal", { source:"start" }); startMenu.classList.add("hidden"); });
  startFiles.addEventListener("click", () => { openApp("files", { source:"start" }); startMenu.classList.add("hidden"); });
  startLogs.addEventListener("click", () => { openApp("logs", { source:"start" }); startMenu.classList.add("hidden"); });
}

function toggleStart(){
  const open = startMenu.classList.contains("hidden");
  if(open){
    startMenu.classList.remove("hidden");
    safeLog("start_menu_opened", {});
  } else {
    startMenu.classList.add("hidden");
    safeLog("start_menu_closed", {});
  }
}

function bringToFront(win){
  win.style.zIndex = String(Date.now());
}

function openApp(app, meta={}){
  if(app === "terminal"){
    winTerminal.classList.remove("hidden");
    bringToFront(winTerminal);
    safeLog("app_opened", { app:"terminal", ...meta });
    focusTerminal();
    return;
  }
  if(app === "files"){
    winFiles.classList.remove("hidden");
    bringToFront(winFiles);
    safeLog("app_opened", { app:"files", ...meta });
    return;
  }
  if(app === "logs"){
    winLogs.classList.remove("hidden");
    bringToFront(winLogs);
    safeLog("app_opened", { app:"logs", ...meta });
    renderLogs();
    return;
  }
}

function closeApp(app){
  if(app === "terminal"){ winTerminal.classList.add("hidden"); safeLog("app_closed",{app}); return; }
  if(app === "files"){ winFiles.classList.add("hidden"); safeLog("app_closed",{app}); return; }
  if(app === "logs"){ winLogs.classList.add("hidden"); safeLog("app_closed",{app}); return; }
}

/* -------------------- LOGGING -------------------- */
function safeLog(event, data){
  const entry = {
    ts: new Date().toISOString(),
    session: SESSION_ID,
    event,
    data
  };

  const existing = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  existing.push(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(existing));

  // live refresh if logs window is open
  if(!winLogs.classList.contains("hidden")) renderLogs();

  // dev console
  console.log("[DESKTOP LOG]", entry);
}

function renderLogs(){
  const items = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  logOut.textContent = items.map(e =>
    `${e.ts}  ${e.event}  ${JSON.stringify(e.data)}`
  ).join("\n");
}

function downloadLogs(){
  const items = localStorage.getItem(LOG_KEY) || "[]";
  const blob = new Blob([items], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `honeypot_desktop_logs_${SESSION_ID}.json`;
  a.click();
  URL.revokeObjectURL(a.href);

  safeLog("logs_downloaded", { bytes: blob.size });
}

/* -------------------- TERMINAL -------------------- */
function focusTerminal(){ termCmd.focus(); }

function updatePrompt(){
  const short = cwd.replace("/home/guest", "~");
  promptEl.textContent = `guest@workstation:${short}$`;
}

function writeTerm(text){
  termOut.textContent += text;
  termOut.scrollTop = termOut.scrollHeight;
}

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

async function handleCommand(raw){
  const cmd = (raw || "").trim();
  if(!cmd) return;

  history.push(cmd);
  histIdx = history.length;
  termCmd.value = "";

  updatePrompt();
  writeTerm(`\n${promptEl.textContent} ${cmd}\n`);
  safeLog("terminal_command", { cmd, cwd });

  await sleep(randInt(60, 220));

  if(BLOCK_PATTERNS.some(rx => rx.test(cmd))){
    writeTerm("Blocked: command not permitted in this environment.\n");
    safeLog("blocked_command", { cmd, reason:"pattern_match" });
    return;
  }

  const parts = cmd.split(/\s+/);
  const base = parts[0].toLowerCase();

  if(!ALLOW_SIM.has(base)){
    writeTerm(`'${base}' is not recognized. Type 'help'.\n`);
    return;
  }

  switch(base){
    case "help":
      writeTerm(
        "Available: help, ls/dir, whoami, pwd, cd, cat/type, echo, clear,\n" +
        "          uname, id, date, ps, netstat\n"
      );
      break;

    case "clear":
      termOut.textContent = "";
      break;

    case "ls":
    case "dir":{
      const items = fs[cwd] ?? [];
      writeTerm(items.length ? items.join("  ") + "\n" : "\n");
      break;
    }

    case "whoami":
      writeTerm("guest\n");
      break;

    case "pwd":
      writeTerm(cwd + "\n");
      break;

    case "cd":{
      const target = parts[1] || "~";
      const next = resolvePath(target);
      if(fs[next]){
        cwd = next;
        updatePrompt();
        // also update Files app path
        openFolder(cwd);
      } else {
        writeTerm(`cd: no such file or directory: ${target}\n`);
      }
      break;
    }

    case "cat":
    case "type":{
      const target = parts[1] || "";
      if(!target){ writeTerm(`${base}: missing file operand\n`); break; }

      if(/secrets\.txt/i.test(target) || /keys\.backup/i.test(target)){
        writeTerm("ACCESS DENIED\n");
        safeLog("attempted_sensitive_file", { target, cwd });
      } else if(/notes\.log/i.test(target)){
        writeTerm("[system] routine maintenance completed\n[auth] login failures detected\n");
      } else if(/report\.txt/i.test(target)){
        writeTerm("Quarterly summary: all systems nominal. (simulated)\n");
      } else {
        writeTerm(`${base}: ${target}: No such file\n`);
      }
      break;
    }

    case "echo":
      writeTerm(cmd.replace(/^echo\s+/i,"") + "\n");
      break;

    case "uname":
      writeTerm("Linux workstation 6.1.0-hardened #1 SMP (simulated)\n");
      break;

    case "id":
      writeTerm("uid=1001(guest) gid=1001(guest) groups=1001(guest)\n");
      break;

    case "date":
      writeTerm(new Date().toString() + "\n");
      break;

    case "ps":
      writeTerm(
        "  PID TTY      TIME CMD\n" +
        "  101 pts/0    00:00:00 shell\n" +
        "  214 pts/0    00:00:00 monitor\n"
      );
      break;

    case "netstat":
      writeTerm(
        "Active Internet connections (simulated)\n" +
        "Proto Local Address      Foreign Address    State\n" +
        "tcp   10.0.0.23:22       10.0.0.1:51234     ESTABLISHED\n"
      );
      break;

    default:
      writeTerm("OK\n");
  }
}

/* -------------------- FILES APP -------------------- */
function openFolder(path){
  cwd = path;
  pathBar.textContent = path;
  safeLog("files_open_folder", { path });

  const items = fs[path] ?? [];
  fileList.innerHTML = "";
  filePreview.textContent = "Preview: (select a file)\n";

  items.forEach(name => {
    const isDir = fs[`${path}/${name}`] != null;
    const el = document.createElement("div");
    el.className = "file";
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="fname">${isDir ? "📁" : "📄"} ${escapeHtml(name)}</div>
      <div class="ftype">${isDir ? "Folder" : "File"}</div>
    `;

    // single click select
    el.addEventListener("click", () => {
      safeLog("files_selected", { path, name, isDir });
      filePreview.textContent = `Selected: ${name}\nType: ${isDir ? "Folder" : "File"}\nPath: ${path}\n`;
    });

    // double click open
    el.addEventListener("dblclick", () => {
      if(isDir){
        openFolder(`${path}/${name}`);
      } else {
        openFile(path, name);
      }
    });

    fileList.appendChild(el);
  });

  // make sure Files window is visible if user navigates from terminal
  if(winFiles.classList.contains("hidden")){
    // not forcing open always; you can uncomment next line if you want it auto-open
    // openApp("files", { reason:"folder_changed" });
  }
}

function openFile(path, name){
  safeLog("file_opened", { path, name });

  // Fake content
  let content = "";
  if(name === "notes.log"){
    content = "[system] routine maintenance completed\n[auth] login failures detected\n";
  } else if(name === "report.txt"){
    content = "Quarterly summary: all systems nominal. (simulated)\n";
  } else if(name === "readme.md"){
    content = "# README\nDecoy workstation environment.\n";
  } else if(name === "secrets.txt" || name === "keys.backup"){
    content = "ACCESS DENIED\n";
    safeLog("attempted_sensitive_file", { target:name, cwd:path });
  } else {
    content = "No preview available (simulated binary or unknown file).\n";
  }

  filePreview.textContent =
    `Opened: ${name}\nPath: ${path}\n\n--- محتوى / Content ---\n${content}`;
}

/* -------------------- CLOCK -------------------- */
function tickClock(){
  const d = new Date();
  const t = d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  clockEl.textContent = t;
  clock2El.textContent = t;
}

/* -------------------- DRAGGING -------------------- */
function makeDraggable(winEl, handleEl){
  let startX=0, startY=0, startLeft=0, startTop=0, dragging=false;

  handleEl.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = winEl.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    bringToFront(winEl);
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

/* -------------------- HELPERS -------------------- */
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

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
