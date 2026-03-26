// ==============================
// 3D Canvas Particles with Smooth Parallax
// ==============================

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

// ------------------------------
// Resize Canvas
// ------------------------------
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
resize();
window.addEventListener("resize", resize);
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".container").classList.add("loaded");
});

// ------------------------------
// Mouse Position for Parallax
// ------------------------------
let mouseX = 0.5;
let mouseY = 0.5;
window.addEventListener("mousemove", e => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
});

// ------------------------------
// Camera Position (Lerp)
// ------------------------------
let camX = 0;
let camY = 0;
const camSpeed = 0.05;

// ------------------------------
// Particle Setup
// ------------------------------
const particles = [];
const maxParticles = 200;

function createParticle() {
    particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.5,
        alpha: 0
    });
}
for (let i = 0; i < maxParticles; i++) createParticle();

// ------------------------------
// Update Particles and Draw
// ------------------------------
function updateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Smooth camera movement
    camX += ((mouseX - 0.5) * 200 - camX) * camSpeed;
    camY += ((mouseY - 0.5) * 200 - camY) * camSpeed;

    for (let p of particles) {
        // 3D movement
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.alpha < 1 && p.z > 20) p.alpha += 0.01;
        if (p.z < -200) {
            p.alpha -= 0.02;
            if (p.alpha < 0) p.alpha = 0;
        }

        const scale = 300 / (300 + p.z);
        const screenX = (p.x + camX) * scale + width / 2;
        const screenY = (p.y + camY) * scale + height / 2;
        const size = scale * 3;
        const alpha = p.alpha * scale;

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,150,150,${alpha})`;
        ctx.fill();

        // Respawn particle if out of bounds
        if (p.alpha <= 0 || screenX < -50 || screenX > width + 50 || screenY < -50 || screenY > height + 50 || p.z > 500) {
            p.x = (Math.random() - 0.5) * width;
            p.y = (Math.random() - 0.5) * height;
            p.z = Math.random() * 500;
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
            p.vz = (Math.random() - 0.5) * 0.5;
            p.alpha = 0;
        }
    }

    // Draw connecting lines between particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dz = particles[i].z - particles[j].z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 150) {
                const alpha = Math.max(0, 0.2 * (1 - dist / 150));
                const scaleI = 300 / (300 + particles[i].z);
                const scaleJ = 300 / (300 + particles[j].z);

                ctx.beginPath();
                ctx.moveTo(particles[i].x * scaleI + width / 2 + camX * scaleI, particles[i].y * scaleI + height / 2 + camY * scaleI);
                ctx.lineTo(particles[j].x * scaleJ + width / 2 + camX * scaleJ, particles[j].y * scaleJ + height / 2 + camY * scaleJ);
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(updateParticles);
}
updateParticles();

// ==============================
// Rotating Symbols Animation
// ==============================
const frames1 = ["/", "|", "\\", "—"];
const frames2 = ["\\", "|", "/", "—"];
let frameIndex1 = 0;
let frameIndex2 = 0;
const leftSymbol = document.getElementById("symL");
const rightSymbol = document.getElementById("symR");
let lastChange = 0;
const delay = 200;

function animateSymbols(time) {
    if (time - lastChange > delay) {
        leftSymbol.textContent = frames1[frameIndex1];
        rightSymbol.textContent = frames2[frameIndex2];

        frameIndex1 = (frameIndex1 + 1) % frames1.length;
        frameIndex2 = (frameIndex2 + 1) % frames2.length;
        lastChange = time;
    }
    requestAnimationFrame(animateSymbols);
}
requestAnimationFrame(animateSymbols);

// ==============================
// Glitch Text Utility
// ==============================
function glitchText(base, length = 3) {
    const chars = "!@#$%^&*()_+-={}[]<>?/\\|~";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${result}`;
}

// ==============================
// Files Tree
// ==============================
const data = {
    "about.txt": "file",
    "projects": { "game1.txt": "file" },
    "arts": { "sketch1.png": "file", "model.jpg": "file" },
    "models": {},
    "links.txt": "file",
    "[???].html": "file"
};

let treeFocused = false;
let selectedIndex = 0;
let flatTree = [];
const filesTree = document.getElementById("tree");

// ------------------------------
// Build Tree Function
// ------------------------------
function buildTree(obj, prefix = "") {
    const keys = Object.keys(obj);
    return keys.map((key, index) => {
        const isLast = index === keys.length - 1;
        const branch = isLast ? " └── " : " ├── ";
        const nextPrefix = prefix + (isLast ? "    " : " │   ");
        const value = obj[key];

        // Apply glitch for "[???]" files
        let displayKey = key;
        if (key.includes("[???]")) displayKey = key.replace("[???]", glitchText("???", 5));

        // Add to flat tree
        flatTree.push({ key: displayKey, isFolder: value && typeof value === "object" });

        let line = prefix + branch + displayKey;
        if (value && typeof value === "object") {
            line += "/";
            if (Object.keys(value).length > 0) line += "\n" + buildTree(value, nextPrefix);
        }
        return line;
    }).join("\n");
}

// ------------------------------
// Render Tree Function
// ------------------------------
let arrowAnimFrame = 0;
function renderTree() {
    flatTree = [];
    let raw = buildTree(data);
    let lines = raw.split("\n");

    lines = lines.map((line, index) => {
        if (index === selectedIndex) {
            const space = arrowAnimFrame > 5 ? " " : "  ";
            arrowAnimFrame++;
            if (arrowAnimFrame > 10) arrowAnimFrame = 0;
            return line + space + "<";
        }
        return line;
    });

    filesTree.textContent = "ex_bat/\n" + lines.join("\n");
}
setInterval(renderTree, 50);

// ------------------------------
// Tree Navigation
// ------------------------------
function moveSelection(dir) {
    selectedIndex += dir;
    if (selectedIndex < 0) selectedIndex = 0;
    if (selectedIndex >= flatTree.length) selectedIndex = flatTree.length - 1;
}

document.addEventListener("keydown", (e) => {
    if (!treeFocused) return;
    if (e.key === "ArrowDown") moveSelection(1);
    if (e.key === "ArrowUp") moveSelection(-1);
});

filesTree.addEventListener("wheel", (e) => {
    if (!treeFocused) return;
    moveSelection(e.deltaY > 0 ? 1 : -1);
    e.preventDefault();
});

// ------------------------------
// Focus/Blur Handling for Explorer
// ------------------------------
const explorer_indicator = document.getElementById("explorer-indicator");

filesTree.addEventListener("focus", () => {
    treeFocused = true;
    explorer_indicator.classList.add("active");
});
filesTree.addEventListener("blur", () => {
    treeFocused = false;
    explorer_indicator.classList.remove("active");
});

// ==============================
// Explorer Window Toggle
// ==============================
const explorer = document.querySelector(".static_window");
const close_explorer = document.getElementById("close-explorer");

close_explorer.addEventListener("click", () => {
    explorer.classList.toggle("collapsed");
});

// ------------------------------
// Page Load Handling
// ------------------------------
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});