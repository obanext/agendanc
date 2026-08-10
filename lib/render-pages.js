import fs from "node:fs";
import path from "node:path";

const ORANGE = "#e7a024";
const TIME_ZONE = "Europe/Amsterdam";

export function slug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatItem(item) {
  const date = new Date(item.start);
  const weekdayLong = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    timeZone: TIME_ZONE
  }).format(date).toLowerCase();
  const weekdayShort = new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    timeZone: TIME_ZONE
  }).format(date).toLowerCase().replace(".", "");
  const day = new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    timeZone: TIME_ZONE
  }).format(date);
  const month = new Intl.DateTimeFormat("nl-NL", {
    month: "short",
    timeZone: TIME_ZONE
  }).format(date).toLowerCase().replace(".", "");
  const time = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE
  }).format(date).replace(":", ".");

  return {
    weekdayLong,
    weekdayShort,
    day,
    month,
    time,
    title: escapeHtml(item.title),
    location: escapeHtml(item.location)
  };
}

function chunks(items, size) {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

function commonScript(pageCount) {
  return `<script>
(function () {
  var pages = document.getElementsByClassName("agenda-page");
  var indicator = document.getElementById("pageIndicator");
  var current = 0;

  function two(value) { return value < 10 ? "0" + value : String(value); }
  function updateTime() {
    var now = new Date();
    document.getElementById("time").innerHTML = two(now.getHours()) + ":" + two(now.getMinutes());
  }
  function showPage(index) {
    var i;
    for (i = 0; i < pages.length; i++) pages[i].style.display = "none";
    if (pages.length) pages[index].style.display = "block";
    indicator.innerHTML = "${pageCount === 0 ? "0/0" : ""}" || ((index + 1) + "/" + pages.length);
  }

  updateTime();
  window.setInterval(updateTime, 60000);
  showPage(0);

  if (pages.length > 1) {
    window.setInterval(function () {
      current = current + 1;
      if (current >= pages.length) current = 0;
      showPage(current);
    }, 8000);
  }
}());
</script>`;
}

function renderLandscape(branch, fontCss) {
  const pageSize = 8;
  const items = branch.items.map(formatItem);
  const pages = chunks(items, pageSize);
  const pageCount = items.length ? pages.length : 0;

  const pageHtml = pages.map((page, pageIndex) => {
    const rows = page.map(item => `<div class="row">
  <div class="day">${item.weekdayLong}</div>
  <div class="date"><strong>${item.day}</strong><span>${item.month}</span></div>
  <div class="details"><div class="title">${item.title}</div><div class="location">${item.location}</div></div>
  <div class="event-time">${item.time}</div>
</div>`).join("");
    const empty = page.length ? "" : `<div class="empty">Geen activiteiten gepland</div>`;
    return `<section class="agenda-page" data-page="${pageIndex + 1}">${rows}${empty}</section>`;
  }).join("");

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link rel="icon" href="data:,">
<title>Weekagenda ${escapeHtml(branch.branch)}</title>
<style>
${fontCss}
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#fff;color:#000;font-family:"Avenir OBA",Arial,Helvetica,sans-serif}*{box-sizing:border-box}.header{height:112px;background:${ORANGE};padding:24px 40px;position:relative}.brand{font-size:50px;font-weight:900;line-height:64px}.brand-white{color:#fff}.header-right{position:absolute;right:40px;top:34px;font-size:34px;font-weight:900}.header-right span{display:inline-block;margin-left:28px}.agenda{height:calc(100% - 112px);padding:8px 48px}.agenda-page{display:none;height:100%}.row{display:table;width:100%;height:12.5%;border-bottom:2px solid ${ORANGE};table-layout:fixed}.row>div{display:table-cell;vertical-align:middle}.day{width:18%;font-size:32px;font-weight:900;text-transform:lowercase}.date{width:105px;height:80px;background:#000;color:#fff;text-align:center;font-weight:900;vertical-align:middle!important}.date strong,.date span{display:block}.date strong{font-size:34px;line-height:38px}.date span{font-size:15px;text-transform:uppercase}.details{padding:0 30px;overflow:hidden}.title{font-size:34px;line-height:40px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.location{margin-top:4px;color:${ORANGE};font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.event-time{width:150px;text-align:right;font-size:34px;font-weight:900}.empty{font-size:42px;font-weight:900;text-align:center;padding-top:300px}
</style>
</head>
<body>
<header class="header"><div class="brand"><span class="brand-white">week</span>agenda</div><div class="header-right"><span id="time"></span><span id="pageIndicator">0/0</span></div></header>
<main class="agenda">${pageHtml}</main>
${commonScript(pageCount)}
</body>
</html>`;
}

function renderPortrait(branch, fontCss) {
  const pageSize = 14;
  const items = branch.items.map(formatItem);
  const pages = chunks(items, pageSize);
  const pageCount = items.length ? pages.length : 0;

  const pageHtml = pages.map((page, pageIndex) => {
    const rows = page.map(item => `<div class="row">
  <div class="day">${item.weekdayShort}</div>
  <div class="date"><strong>${item.day}</strong><span>${item.month}</span></div>
  <div class="details"><div class="title">${item.title}</div><div class="location">${item.location}</div><div class="event-time">${item.time} uur</div></div>
</div>`).join("");
    const empty = page.length ? "" : `<div class="empty">Geen activiteiten gepland</div>`;
    return `<section class="agenda-page" data-page="${pageIndex + 1}">${rows}${empty}</section>`;
  }).join("");

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link rel="icon" href="data:,">
<title>Weekagenda ${escapeHtml(branch.branch)}</title>
<style>
${fontCss}
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#fff;color:#000;font-family:"Avenir OBA",Arial,Helvetica,sans-serif}*{box-sizing:border-box}.header{height:112px;background:${ORANGE};padding:24px 32px;position:relative}.brand{font-size:50px;font-weight:900;line-height:64px}.brand-white{color:#fff}.clock{position:absolute;right:32px;top:36px;color:#fff;font-size:34px;font-weight:900}.agenda{height:calc(100% - 178px);padding:0 32px}.agenda-page{display:none;height:100%}.row{display:table;width:100%;height:7.142%;border-bottom:2px solid rgba(231,160,36,.45);table-layout:fixed}.row>div{display:table-cell;vertical-align:middle}.day{width:68px;font-size:28px;font-weight:900;text-transform:lowercase}.date{width:82px;height:76px;background:#000;color:#fff;text-align:center;font-weight:900;vertical-align:middle!important}.date strong,.date span{display:block}.date strong{font-size:32px;line-height:36px}.date span{font-size:14px;text-transform:uppercase}.details{padding-left:22px;overflow:hidden}.title{font-size:30px;line-height:34px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.location{margin-top:2px;color:${ORANGE};font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.event-time{margin-top:2px;font-size:20px;font-weight:900}.footer{height:66px;padding:14px 32px;text-align:right;font-size:30px;font-weight:900}.empty{font-size:40px;font-weight:900;text-align:center;padding-top:650px}
</style>
</head>
<body>
<header class="header"><div class="brand"><span class="brand-white">week</span>agenda</div><div id="time" class="clock"></div></header>
<main class="agenda">${pageHtml}</main>
<footer class="footer"><span id="pageIndicator">0/0</span></footer>
${commonScript(pageCount)}
</body>
</html>`;
}

export function writePages(data, publicDir) {
  const lightFont = fs.readFileSync(path.join(publicDir, "AvenirLight.woff2")).toString("base64");
  const blackFont = fs.readFileSync(path.join(publicDir, "AvenirBlack.woff2")).toString("base64");
  const fontCss = `@font-face{font-family:"Avenir OBA";src:url(data:font/woff2;base64,${lightFont}) format("woff2");font-weight:300;font-style:normal}
@font-face{font-family:"Avenir OBA";src:url(data:font/woff2;base64,${blackFont}) format("woff2");font-weight:900;font-style:normal}`;

  const tempDir = path.join(publicDir, ".screens-temp");
  const landscapeTemp = path.join(tempDir, "landscape");
  const portraitTemp = path.join(tempDir, "portrait");

  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(landscapeTemp, { recursive: true });
  fs.mkdirSync(portraitTemp, { recursive: true });

  for (const branch of Object.values(data)) {
    const fileName = `${slug(branch.branch)}.html`;
    fs.writeFileSync(path.join(landscapeTemp, fileName), renderLandscape(branch, fontCss));
    fs.writeFileSync(path.join(portraitTemp, fileName), renderPortrait(branch, fontCss));
  }

  for (const orientation of ["landscape", "portrait"]) {
    const target = path.join(publicDir, orientation);
    fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(path.join(tempDir, orientation), target);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
}
