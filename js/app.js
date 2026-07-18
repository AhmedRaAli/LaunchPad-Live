
 
/* ============================== DATA ==================================== */
 
// TODAY is the real current date the browser reports. In the reference
// diagram it's shown as a fixed example (2025-05-20) just to make the math
// easy to follow — in the live site it must stay dynamic.
const TODAY = new Date();
const DAY_MS = 86400000; // milliseconds in one day (1000 * 60 * 60 * 24)
 
/**
 * offsetDate — returns a "YYYY-MM-DD" string that is `days` away from a
 * base date. Used below so the demo launch dates move together with
 * whatever day the site is actually opened on, instead of staying frozen
 * on the reference diagram's example date (2025-05-20).
 */
function offsetDate(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
 
// Three parallel arrays — the same index in each array describes the same course.
// The day-offsets below (-19, -5, +12, +31, +51) match the reference diagram's
// example math exactly, just anchored to today instead of a fixed past date —
// so the results always include a mix of already-started, starting-soon, and
// upcoming courses, no matter when the page is opened.
const COURSE_NAMES    = ["HTML Basics", "CSS Mastery", "JavaScript Fundamentals", "React Basics", "Node.js Essentials"];
const COURSE_STATUSES = ["Published",   "In Progress", "Not Started",             "In Progress",  "Not Started"];
const LAUNCH_DATES    = [
  offsetDate(TODAY, -19),
  offsetDate(TODAY, -5),
  offsetDate(TODAY, 12),
  offsetDate(TODAY, 31),
  offsetDate(TODAY, 51),
];
 
/* ============================== LOGIC ==================================== */
 
/**
 * daysUntil — how many whole days separate TODAY from a course's launch date.
 * Both dates are normalized to midnight first, so the subtraction never
 * drifts by a day because of leftover hours/minutes.
 * @param {string} launchDateStr - e.g. "2025-06-01"
 * @returns {number} positive = in the future, 0 = today, negative = already passed
 */
function daysUntil(launchDateStr) {
  const launch = new Date(launchDateStr);
  const launchMidnight = new Date(launch.getFullYear(), launch.getMonth(), launch.getDate());
  const todayMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
 
  const diffMs = launchMidnight - todayMidnight;
  return Math.round(diffMs / DAY_MS);
}
 
/**
 * dayLabel — turns a day count into one of FOUR buckets (matches the
 * reference diagram: -5 → red, 0 → orange, 12 → blue, 31 → purple).
 * @param {number} days
 * @returns {string}
 */
function dayLabel(days) {
  if (days < 0) {
    return "Already Started";      // red   — launch date is in the past
  } else if (days === 0) {
    return "Starting Today";       // orange — launches today
  } else if (days <= 14) {
    return "Starting Soon";        // blue  — within the next two weeks
  } else {
    return "Upcoming";             // purple — further out than two weeks
  }
}
 
/**
 * filterByStatus — walks the parallel arrays and returns only the courses
 * whose status exactly matches the one requested.
 * @param {string} status - must exactly match a value in COURSE_STATUSES
 * @returns {Array<{name: string, status: string, launchDate: string}>}
 */
function filterByStatus(status) {
  const matches = [];
  for (let i = 0; i < COURSE_STATUSES.length; i++) {
    if (COURSE_STATUSES[i] === status) {
      matches.push({
        name: COURSE_NAMES[i],
        status: COURSE_STATUSES[i],
        launchDate: LAUNCH_DATES[i],
      });
    }
  }
  return matches;
}
 
/* ============================== LOOPS ==================================== */
 
/**
 * printCourseList — prints one clean, aligned block of course rows to the
 * console. Uses console.group so each section can be collapsed/expanded,
 * and padEnd() so every column lines up like a real table — this avoids
 * console.table(), whose output can render as a messy collapsed array
 * depending on the browser/devtools version.
 * @param {string} title
 * @param {string} color - a hex color for the section's banner
 * @param {Array<{name:string,status:string,days:number,label:string}>} rows
 */
function printCourseList(title, color, rows) {
  console.group(`%c${title}`, `background:${color};color:#fff;padding:3px 10px;border-radius:4px;font-weight:bold;`);
 
  if (rows.length === 0) {
    console.log("(no courses match)");
    console.groupEnd();
    return;
  }
 
  const header = `#   Course                      Status         Days    Label`;
  console.log(header);
  console.log("-".repeat(header.length));
 
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line =
      `${String(i + 1).padEnd(4)}` +
      `${r.name.padEnd(28)}` +
      `${r.status.padEnd(15)}` +
      `${String(r.days).padEnd(8)}` +
      `${r.label}`;
    console.log(line);
  }
 
  console.groupEnd();
}
 
// ---- 1. ALL COURSES ----
const allCourses = [];
for (let i = 0; i < COURSE_NAMES.length; i++) {
  const days = daysUntil(LAUNCH_DATES[i]);
  allCourses.push({
    name: COURSE_NAMES[i],
    status: COURSE_STATUSES[i],
    days: days,
    label: dayLabel(days),
  });
}
printCourseList("1. ALL COURSES", "#2563eb", allCourses);
 
// ---- 2. OPEN COURSES ONLY (status === "Published") ----
const openCourses = filterByStatus("Published");
const openRows = [];
for (let i = 0; i < openCourses.length; i++) {
  const days = daysUntil(openCourses[i].launchDate);
  openRows.push({
    name: openCourses[i].name,
    status: openCourses[i].status,
    days: days,
    label: dayLabel(days),
  });
}
printCourseList("2. OPEN COURSES ONLY", "#f59e0b", openRows);
 
// ---- 3. UPCOMING COURSES ONLY (days > 0) ----
const upcomingRows = [];
for (let i = 0; i < COURSE_NAMES.length; i++) {
  const days = daysUntil(LAUNCH_DATES[i]);
  if (days > 0) {
    upcomingRows.push({
      name: COURSE_NAMES[i],
      status: COURSE_STATUSES[i],
      days: days,
      label: dayLabel(days),
    });
  }
}
printCourseList("3. UPCOMING COURSES ONLY", "#16a34a", upcomingRows);
 
/* ==================== UI ================================ */
 
// Fill in each "Days Left" badge on the course cards using the functions above.
document.addEventListener("DOMContentLoaded", () => {
  const badges = document.querySelectorAll(".days-left-badge");
 
  badges.forEach((badge) => {
    const courseName = badge.dataset.course;
    const index = COURSE_NAMES.indexOf(courseName);
    if (index === -1) return;
 
    const days = daysUntil(LAUNCH_DATES[index]);
    badge.textContent = dayLabel(days);
  });
 
  initSlider();
  initMobileMenuClose();
});
 
/* ---- Course slider ---- */
function initSlider() {
  const track = document.getElementById("sliderTrack");
  const dotsWrap = document.getElementById("sliderDots");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
 
  if (!track) return;
 
  const slides = Array.from(track.children);
  let currentIndex = 0;
 
  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);
 
  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
  }
 
  prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
 
  // Basic drag / swipe support
  let startX = 0;
  let isDragging = false;
 
  track.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
  });
  track.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - startX;
    if (diff > 50) goToSlide(currentIndex - 1);
    else if (diff < -50) goToSlide(currentIndex + 1);
  });
}
 

function initMobileMenuClose() {
  const toggle = document.getElementById("menu-toggle");
  const links = document.querySelectorAll(".mobile-drawer a");
 
  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (toggle) toggle.checked = false;
    });
  });
}
 

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signup-form");
  if (!form) return;
 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
 
    const entry = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      course: document.getElementById("course").value,
      seats: document.getElementById("seats").value,
      startDate: document.getElementById("startDate").value,
      message: document.getElementById("message").value,
    };
 
    console.log("New sign-up submitted:", entry);
    alert(`Thanks, ${entry.fullName || "learner"}! You're on the list for ${entry.course}.`);
    form.reset();
  });
});
 