/*==================================================
NT-01 Premium Website
JavaScript Part 1
==================================================*/

/*==============================
PRELOADER
==============================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("preloader");

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

    }, 1200);

});

/*==============================
BACK TO TOP BUTTON
==============================*/

const topButton = document.getElementById("topButton");

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        topButton.style.display = "flex";

    } else {

        topButton.style.display = "none";

    }

});

topButton.addEventListener("click", () => {

    window.scrollTo({

        top: 0,
        behavior: "smooth"

    });

});

/*==============================
HEADER EFFECT
==============================*/

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.style.background = "rgba(0,0,0,.72)";
        header.style.boxShadow = "0 10px 40px rgba(0,0,0,.4)";

    } else {

        header.style.background = "rgba(0,0,0,.35)";
        header.style.boxShadow = "none";

    }

});

/*==============================
MOBILE NAVIGATION
==============================*/

const menuToggle = document.getElementById("menuToggle");
const navLinksMenu = document.getElementById("navLinks");

if (menuToggle && navLinksMenu) {

    menuToggle.addEventListener("click", () => {

        const isOpen = navLinksMenu.classList.toggle("open");

        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("menu-open", isOpen);

    });

    navLinksMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinksMenu.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");

        });

    });

    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) {

            navLinksMenu.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");

        }

    });

}

/*==============================
SCROLL REVEAL
==============================*/

const revealItems = document.querySelectorAll(

".compare-card,.feature-card,.glass-card,.gallery-item,.booking-box,.newsletter-card"

);

const reveal = () => {

    revealItems.forEach(item => {

        const top = item.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {

            item.classList.add("fade-up");
            item.classList.add("show");

        }

    });

};

window.addEventListener("scroll", reveal);

reveal();

/*==============================
CUSTOM CURSOR
==============================*/

const cursor = document.querySelector(".cursor");
const dot = document.querySelector(".cursor-dot");

window.addEventListener("mousemove", e => {

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";

});

document.querySelectorAll("a,button").forEach(item => {

    item.addEventListener("mouseenter", () => {

        cursor.style.width = "65px";
        cursor.style.height = "65px";
        cursor.style.borderColor = "#ffffff";

    });

    item.addEventListener("mouseleave", () => {

        cursor.style.width = "40px";
        cursor.style.height = "40px";
        cursor.style.borderColor = "rgba(255,255,255,.45)";

    });

});

/*==============================
SMOOTH IMAGE HOVER
==============================*/

const images = document.querySelectorAll(

".gallery-item,.compare-card,.feature-card"

);

images.forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.background =

        `radial-gradient(circle at ${x}px ${y}px,
        rgba(255,255,255,.07),
        rgba(255,255,255,.03) 60%)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.background =

        "rgba(255,255,255,.04)";

    });

});

/*==============================
ACTIVE NAVIGATION
==============================*/

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 120;

        if (window.scrollY >= top) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (

            link.getAttribute("href") === "#" + current

        ) {

            link.classList.add("active");

        }

    });

});
/*==================================================
NT-01 Premium Website
JavaScript Part 2
==================================================*/

/*==============================
HERO PARALLAX
==============================*/

const heroImage = document.querySelector(".hero-image");

window.addEventListener("mousemove", (e) => {

    if(!heroImage || window.innerWidth <= 900) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    heroImage.style.transform =
        `translate(${x}px,${y}px)`;

});

/*==============================
FLOATING ANIMATION
==============================*/

let float = 0;

function floatingAnimation(){

    float += 0.02;

    if(heroImage && window.innerWidth > 900){

        heroImage.style.marginTop =
            Math.sin(float) * 8 + "px";

    } else if(heroImage){

        heroImage.style.marginTop = "0";

    }

    requestAnimationFrame(floatingAnimation);

}

floatingAnimation();

/*==============================
MAGNETIC BUTTONS
==============================*/

document.querySelectorAll(
".primary-btn,.secondary-btn,.nav-btn"
).forEach(button=>{

button.addEventListener("mousemove",e=>{

const rect=button.getBoundingClientRect();

const x=e.clientX-rect.left-rect.width/2;
const y=e.clientY-rect.top-rect.height/2;

button.style.transform=
`translate(${x*0.18}px,${y*0.18}px)`;

});

button.addEventListener("mouseleave",()=>{

button.style.transform="translate(0,0)";

});

});

/*==============================
3D CARD TILT
==============================*/

document.querySelectorAll(

".feature-card,.compare-card,.glass-card"

).forEach(card=>{

card.addEventListener("mousemove",e=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

const rotateX=(y-rect.height/2)/18;
const rotateY=(rect.width/2-x)/18;

card.style.transform=

`perspective(1000px)
rotateX(${-rotateX}deg)
rotateY(${rotateY}deg)
translateY(-8px)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

/*==============================
BUTTON RIPPLE
==============================*/

document.querySelectorAll("button,a").forEach(btn=>{

btn.addEventListener("click",function(e){

const ripple=document.createElement("span");

const rect=this.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.position="absolute";
ripple.style.width=size+"px";
ripple.style.height=size+"px";
ripple.style.borderRadius="50%";
ripple.style.left=(e.clientX-rect.left-size/2)+"px";
ripple.style.top=(e.clientY-rect.top-size/2)+"px";
ripple.style.background="rgba(255,255,255,.25)";
ripple.style.transform="scale(0)";
ripple.style.transition=".6s";
ripple.style.pointerEvents="none";

this.style.position="relative";
this.style.overflow="hidden";

this.appendChild(ripple);

requestAnimationFrame(()=>{
ripple.style.transform="scale(4)";
ripple.style.opacity="0";
});

setTimeout(()=>{
ripple.remove();
},600);

});

});

/*==============================
SCROLL PROGRESS BAR
==============================*/

const progress=document.createElement("div");

progress.style.position="fixed";
progress.style.left="0";
progress.style.top="0";
progress.style.height="3px";
progress.style.width="0";
progress.style.background="#ffffff";
progress.style.zIndex="99999";

document.body.appendChild(progress);

window.addEventListener("scroll",()=>{

const total=
document.documentElement.scrollHeight-
window.innerHeight;

const percent=
(window.scrollY/total)*100;

progress.style.width=percent+"%";

});

/*==============================
YEAR
==============================*/

const year=document.querySelector(".year");

if(year){

year.textContent=
new Date().getFullYear();

}

/*==============================
CONSOLE MESSAGE
==============================*/

console.log(

"%cNT-01 Premium Website",
"font-size:24px;color:white;background:black;padding:12px;border-radius:8px"

);

console.log(
"Designed with ❤"
);