// canvas 3D particles with smooth parallax

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

function resize(){
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

// mouse position for parallax
let mouseX = 0.5;
let mouseY = 0.5;
window.addEventListener("mousemove", e => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
});

// camera position (lerp)
let camX = 0;
let camY = 0;
const camSpeed = 0.05; // чем меньше, тем плавнее

// 3D particle setup
const particles = [];
const maxParticles = 150;

function createParticle(){
    particles.push({
        x: (Math.random()-0.5)*width,
        y: (Math.random()-0.5)*height,
        z: Math.random()*500,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        vz: (Math.random()-0.5)*0.5,
        alpha: 0
    });
}

for(let i=0;i<maxParticles;i++) createParticle();

function updateParticles(){
    ctx.clearRect(0,0,width,height);

    // плавная камера (lerp)
    camX += ((mouseX - 0.5) * 200 - camX) * camSpeed;
    camY += ((mouseY - 0.5) * 200 - camY) * camSpeed;

    for(let p of particles){
        // движение в 3D
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // плавное появление
        if(p.alpha < 1 && p.z > 20) p.alpha += 0.01; // обычное появление

        // если частица слишком близко к камере, плавно исчезает
        if(p.z < 20){
            p.alpha -= 0.02; // скорость затухания
            if(p.alpha < 0) p.alpha = 0;
        }

        // перспектива
        const scale = 300 / (300 + p.z);
        const screenX = (p.x + camX) * scale + width/2;
        const screenY = (p.y + camY) * scale + height/2;
        const size = scale * 3;
        const alpha = p.alpha * scale; // ближе = ярче

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(150,150,150,${alpha})`;
        ctx.fill();

        // сброс, если полностью исчезла или улетела
        if(p.alpha <= 0 || screenX < -50 || screenX > width+50 || screenY < -50 || screenY > height+50 || p.z > 500){
            p.x = (Math.random()-0.5)*width;
            p.y = (Math.random()-0.5)*height;
            p.z = Math.random()*500;
            p.vx = (Math.random()-0.5)*0.3;
            p.vy = (Math.random()-0.5)*0.3;
            p.vz = (Math.random()-0.5)*0.5;
            p.alpha = 0;
        }
    }

    // линии соединения
    for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dz = particles[i].z - particles[j].z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if(dist<150){
                const alpha = Math.max(0, 0.2*(1-dist/150));
                const scaleI = 300/(300+particles[i].z);
                const scaleJ = 300/(300+particles[j].z);
                ctx.beginPath();
                ctx.moveTo(particles[i].x*scaleI + width/2 + camX*scaleI, particles[i].y*scaleI + height/2 + camY*scaleI);
                ctx.lineTo(particles[j].x*scaleJ + width/2 + camX*scaleJ, particles[j].y*scaleJ + height/2 + camY*scaleJ);
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(updateParticles);
}

updateParticles();

// rotating symbols animation
const frames1 = ["/","|","\\","—"];
const frames2 = ["\\","|","/","—"];
let frameIndex1 = 0;
let frameIndex2 = 0;

const leftSymbol = document.getElementById("symL");
const rightSymbol = document.getElementById("symR");

let lastChange = 0;
const delay = 200;

function animateSymbols(time){
    if(time - lastChange > delay){
        leftSymbol.textContent = frames1[frameIndex1];
        rightSymbol.textContent = frames2[frameIndex2];

        frameIndex1 = (frameIndex1+1)%frames1.length;
        frameIndex2 = (frameIndex2+1)%frames2.length;
        lastChange = time;
    }
    requestAnimationFrame(animateSymbols);
}

requestAnimationFrame(animateSymbols);

async function loadTree(){

    const response = await fetch("assets/files_structure.json");

    const data = await response.json();

    const treeElement = document.getElementById("tree");

    treeElement.textContent =
        "assets/ex-bat\n" +
        generateTree(data);

}
function glitchText(base, length = 3) {
    const chars = "!@#$%^&*()_+-={}[]<>?/\\|~";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return `[${result}]`;
}
function generateTree(obj, prefix = "") {
    const keys = Object.keys(obj);

    return keys.map((key, index) => {
        const isLast = index === keys.length - 1;
        const branch = isLast ? "└── " : "├── ";
        const nextPrefix = prefix + (isLast ? "    " : "│   ");

        const value = obj[key];

        // 👾 Глитч для имени
        let displayKey = key;
        if (key.includes("[???]")) {
            displayKey = key.replace("[???]", glitchText("[???]", 5));
        }

        if (value && typeof value === "object") {
            const isEmpty =
                (Array.isArray(value) && value.length === 0) ||
                (!Array.isArray(value) && Object.keys(value).length === 0);

            if (isEmpty) {
                return prefix + branch + displayKey + "/ (empty)";
            }

            return (
                prefix + branch + displayKey + "/\n" +
                generateTree(value, nextPrefix)
            );
        }

        return prefix + branch + displayKey;
    }).join("\n");
}
setInterval(() => {
    document.getElementById("tree").textContent = generateTree(data);
}, 200);

loadTree();