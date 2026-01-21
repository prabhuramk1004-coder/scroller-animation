<<<<<<< HEAD
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const frameCount = 240; // Adjust to match your EZGIF export
const images = [];
let currentFrame = 0;

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(currentFrame);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* Generate frame path */
function getFramePath(index) {
  return `frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

/* Preload images */
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = getFramePath(i);
  images.push(img);
}

/* Draw frame to canvas */
function renderFrame(index) {
  const img = images[index];
  if (!img) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Maintain aspect ratio (cover)
  const scale = Math.max(
    canvas.width / img.width,
    canvas.height / img.height
  );

  const x = (canvas.width - img.width * scale) / 2;
  const y = (canvas.height - img.height * scale) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
}

/* Scroll → frame mapping */
const scrollSection = document.querySelector(".scroll-section");

function onScroll() {
  const rect = scrollSection.getBoundingClientRect();
  const scrollableHeight = scrollSection.offsetHeight - window.innerHeight;
  const scrolled = Math.min(
    scrollableHeight,
    Math.max(0, -rect.top)
  );

  const progress = scrolled / scrollableHeight;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(progress * frameCount)
  );

  if (frameIndex !== currentFrame) {
    currentFrame = frameIndex;
    requestAnimationFrame(() => renderFrame(currentFrame));
  }
}

window.addEventListener("scroll", onScroll);

/* Render first frame once loaded */
images[0].onload = () => renderFrame(0);
=======
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const frameCount = 240; // Adjust to match your EZGIF export
const images = [];
let currentFrame = 0;

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(currentFrame);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* Generate frame path */
function getFramePath(index) {
  return `frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

/* Preload images */
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = getFramePath(i);
  images.push(img);
}

/* Draw frame to canvas */
function renderFrame(index) {
  const img = images[index];
  if (!img) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Maintain aspect ratio (cover)
  const scale = Math.max(
    canvas.width / img.width,
    canvas.height / img.height
  );

  const x = (canvas.width - img.width * scale) / 2;
  const y = (canvas.height - img.height * scale) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
}

/* Scroll → frame mapping */
const scrollSection = document.querySelector(".scroll-section");

function onScroll() {
  const rect = scrollSection.getBoundingClientRect();
  const scrollableHeight = scrollSection.offsetHeight - window.innerHeight;
  const scrolled = Math.min(
    scrollableHeight,
    Math.max(0, -rect.top)
  );

  const progress = scrolled / scrollableHeight;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(progress * frameCount)
  );

  if (frameIndex !== currentFrame) {
    currentFrame = frameIndex;
    requestAnimationFrame(() => renderFrame(currentFrame));
  }
}

window.addEventListener("scroll", onScroll);

/* Render first frame once loaded */
images[0].onload = () => renderFrame(0);
>>>>>>> 591addd (Initial commit - scroll animation project)
