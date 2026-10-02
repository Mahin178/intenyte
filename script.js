/*==================================================
INTENYTE Premium Website
Main Script — Complete Redesign
==================================================*/

/*==============================
PRELOADER
==============================*/

window.addEventListener("load", function() {
    var loader = document.getElementById("preloader");
    if (loader) {
        setTimeout(function() {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 1000);
    }
});

/*==============================
BACK TO TOP BUTTON
==============================*/

var topButton = document.getElementById("topButton");

window.addEventListener("scroll", function() {
    if (topButton) {
        topButton.style.display = window.scrollY > 400 ? "flex" : "none";
    }
});

if (topButton) {
    topButton.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/*==============================
HEADER SCROLL EFFECT
==============================*/

var header = document.querySelector(".header");

window.addEventListener("scroll", function() {
    if (header) {
        if (window.scrollY > 80) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

/*==============================
MOBILE NAVIGATION
==============================*/

var menuToggle = document.getElementById("menuToggle");
var navLinksMenu = document.getElementById("navLinks");

if (menuToggle && navLinksMenu) {
    menuToggle.addEventListener("click", function() {
        var isOpen = navLinksMenu.classList.toggle("open");
        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("menu-open", isOpen);
    });

    navLinksMenu.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
            navLinksMenu.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });

    window.addEventListener("resize", function() {
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

var revealSelectors = ".compare-card,.feature-card,.glass-card,.gallery-item,.booking-box,.testimonial-card,.spec-item,.viewer-feature,.config-group,.showcase-image,.showcase-info,.product-hero-image,.product-hero-info";
var revealItems = document.querySelectorAll(revealSelectors);

var reveal = function() {
    revealItems.forEach(function(item) {
        var top = item.getBoundingClientRect().top;
        if (top < window.innerHeight - 80) {
            item.classList.add("fade-up", "show");
        }
    });
};

window.addEventListener("scroll", reveal);
reveal();

/*==============================
CUSTOM CURSOR
==============================*/

var cursor = document.querySelector(".cursor");
var dot = document.querySelector(".cursor-dot");

if (cursor && dot && window.innerWidth > 768) {
    window.addEventListener("mousemove", function(e) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
    });

    document.querySelectorAll("a,button,.color-swatch,.theme-option,.toggle-switch,.demo-control-card,.demo-room").forEach(function(item) {
        item.addEventListener("mouseenter", function() {
            cursor.style.width = "60px";
            cursor.style.height = "60px";
            cursor.style.borderColor = "rgba(0,191,165,.5)";
        });
        item.addEventListener("mouseleave", function() {
            cursor.style.width = "40px";
            cursor.style.height = "40px";
            cursor.style.borderColor = "rgba(0,191,165,.35)";
        });
    });
}

/*==============================
3D CARD TILT
==============================*/

document.querySelectorAll(".feature-card,.compare-card,.glass-card,.testimonial-card,.spec-item").forEach(function(card) {
    card.addEventListener("mousemove", function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rotateX = (y - rect.height / 2) / 20;
        var rotateY = (rect.width / 2 - x) / 20;
        card.style.transform = "perspective(800px) rotateX(" + (-rotateX) + "deg) rotateY(" + rotateY + "deg) translateY(-6px)";
    });
    card.addEventListener("mouseleave", function() {
        card.style.transform = "";
    });
});

/*==============================
MAGNETIC BUTTONS
==============================*/

document.querySelectorAll(".primary-btn,.secondary-btn,.nav-btn").forEach(function(button) {
    button.addEventListener("mousemove", function(e) {
        var rect = button.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        button.style.transform = "translate(" + (x * 0.15) + "px," + (y * 0.15) + "px)";
    });
    button.addEventListener("mouseleave", function() {
        button.style.transform = "";
    });
});

/*==============================
BUTTON RIPPLE
==============================*/

document.querySelectorAll("button,a").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
        var ripple = document.createElement("span");
        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        ripple.style.cssText = "position:absolute;width:" + size + "px;height:" + size + "px;border-radius:50%;left:" + (e.clientX - rect.left - size / 2) + "px;top:" + (e.clientY - rect.top - size / 2) + "px;background:rgba(0,191,165,.15);transform:scale(0);transition:.6s;pointer-events:none;";
        this.style.position = "relative";
        this.style.overflow = "hidden";
        this.appendChild(ripple);
        requestAnimationFrame(function() {
            ripple.style.transform = "scale(4)";
            ripple.style.opacity = "0";
        });
        setTimeout(function() { ripple.remove(); }, 600);
    });
});

/*==============================
SCROLL PROGRESS BAR
==============================*/

var progress = document.createElement("div");
progress.style.cssText = "position:fixed;left:0;top:0;height:3px;width:0;background:linear-gradient(90deg,#00BFA5,#00E5FF);z-index:99999;transition:width .1s;";
document.body.appendChild(progress);

window.addEventListener("scroll", function() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var percent = (window.scrollY / total) * 100;
    progress.style.width = percent + "%";
});

/*==============================
HERO PARALLAX
==============================*/

var heroImage = document.querySelector(".hero-image");

window.addEventListener("mousemove", function(e) {
    if (!heroImage || window.innerWidth <= 900) return;
    var x = (e.clientX / window.innerWidth - 0.5) * 15;
    var y = (e.clientY / window.innerHeight - 0.5) * 15;
    heroImage.style.transform = "translate(" + x + "px," + y + "px)";
});

/*==============================
FLOATING ANIMATION
==============================*/

var floatAngle = 0;

function floatingAnimation() {
    floatAngle += 0.015;
    if (heroImage && window.innerWidth > 900) {
        heroImage.style.marginTop = Math.sin(floatAngle) * 6 + "px";
    }
    requestAnimationFrame(floatingAnimation);
}

floatingAnimation();

/*==============================
CART DRAWER
==============================*/

var cartToggle = document.getElementById("cartToggle");
var cartDrawer = document.getElementById("cartDrawer");
var cartOverlay = document.getElementById("cartOverlay");
var cartClose = document.getElementById("cartClose");
var cartBody = document.getElementById("cartBody");
var cartTotal = document.getElementById("cartTotal");

function openCart() {
    if (cartDrawer) cartDrawer.classList.add("open");
    if (cartOverlay) cartOverlay.classList.add("open");
    renderCartDrawer();
}

function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove("open");
    if (cartOverlay) cartOverlay.classList.remove("open");
}

function renderCartDrawer() {
    if (!cartBody || typeof Cart === "undefined") return;
    var items = Cart.getItems();

    if (items.length === 0) {
        cartBody.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">&#128722;</div><h4>Your cart is empty</h4><p>Add the NT-01 to get started.</p></div>';
    } else {
        var html = "";
        items.forEach(function(item) {
            html += '<div class="cart-item">' +
                '<div class="cart-item-image"><img src="img/Hero_image.png" alt=""></div>' +
                '<div class="cart-item-details">' +
                '<div class="cart-item-name">' + item.name + '</div>' +
                '<div class="cart-item-variant">' + (item.variant || "Standard") + '</div>' +
                '<div class="cart-item-price">&#8377;' + Cart.formatPrice(item.price) + '</div>' +
                '</div>' +
                '<button class="cart-item-remove" data-id="' + item.id + '">&times;</button>' +
                '</div>';
        });
        cartBody.innerHTML = html;

        cartBody.querySelectorAll(".cart-item-remove").forEach(function(btn) {
            btn.addEventListener("click", function() {
                Cart.removeItem(this.dataset.id);
                renderCartDrawer();
            });
        });
    }

    if (cartTotal) {
        cartTotal.textContent = "\u20B9" + Cart.formatPrice(Cart.getTotal());
    }
}

if (cartToggle) cartToggle.addEventListener("click", openCart);
if (cartClose) cartClose.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

document.addEventListener("cartUpdate", function() {
    renderCartDrawer();
});

/*==============================
YEAR
==============================*/

var yearEl = document.querySelector(".year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/*==============================
CONSOLE MESSAGE
==============================*/

console.log(
    "%cINTENYTE NT-01",
    "font-size:24px;color:#00BFA5;background:#050505;padding:12px 20px;border-radius:8px;font-weight:bold"
);
console.log("%cFuture Into Reality", "color:#666;font-size:12px");
