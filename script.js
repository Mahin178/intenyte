/*==================================================
INTENYTE Premium Website
Main Script — Complete Redesign
==================================================*/

/*==============================
CLEAN URL GUARD
Production: *.html URLs -> clean URLs (/, /product, /cart)
Local preview (file://): clean links -> real files
==============================*/

(function() {
    var loc = window.location;

    if (loc.protocol === "file:") {
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.getAttribute("href");
                if (!href || href.charAt(0) !== "/" || href.indexOf("//") === 0) return;
                var hash = "";
                var path = href;
                var hi = path.indexOf("#");
                if (hi > -1) { hash = path.slice(hi); path = path.slice(0, hi); }
                if (path === "/" || path === "") { a.setAttribute("href", "index.html" + hash); return; }
                if (path.slice(-1) === "/") { a.setAttribute("href", path.slice(1) + "index.html" + hash); return; }
                a.setAttribute("href", path.slice(1) + ".html" + hash);
            });
        });
        return;
    }

    var p = loc.pathname;
    if (p.slice(-5) === ".html") {
        var clean = p.slice(0, -5);
        if (clean.slice(-6) === "/index") clean = clean.slice(0, -5);
        loc.replace(clean + loc.search + loc.hash);
    }
})();

/*==============================
PRELOADER — fast, resilient
==============================*/

(function () {
    var done = false;
    function hide() {
        if (done) return; done = true;
        var loader = document.getElementById("preloader");
        if (loader) {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            setTimeout(function () { loader.remove(); }, 700);
        }
    }
    window.addEventListener("load", function () { setTimeout(hide, 400); });
    setTimeout(hide, 2500); // never trap mobile users
})();

/*==============================
BACK TO TOP BUTTON
==============================*/

var topButton = document.getElementById("topButton");

window.addEventListener("scroll", function() {
    if (topButton) {
        topButton.style.display = window.scrollY > 400 ? "flex" : "none";
    }
}, { passive: true });

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
}, { passive: true });

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
SCROLL REVEAL — IntersectionObserver (1 listener, GPU cheap)
==============================*/

(function () {
    var items = document.querySelectorAll(".compare-card,.feature-card,.glass-card,.gallery-item,.booking-box,.testimonial-card,.spec-item,.viewer-feature,.config-group,.showcase-image,.showcase-info,.product-hero-image,.product-hero-info");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
        items.forEach(function (i) { i.classList.add("fade-up", "show"); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) {
                en.target.classList.add("fade-up", "show");
                io.unobserve(en.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (i) { i.classList.add("fade-up"); io.observe(i); });
})();

/*==============================
CUSTOM CURSOR — fine pointers only
==============================*/

var cursor = document.querySelector(".cursor");
var dot = document.querySelector(".cursor-dot");
var finePointer = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

if (cursor && dot && finePointer && window.innerWidth > 768) {
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
3D CARD TILT — desktop fine-pointers only
==============================*/

if (finePointer && window.innerWidth > 900) {
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
}

/*==============================
MAGNETIC BUTTONS — desktop fine-pointers only
==============================*/

if (finePointer && window.innerWidth > 900) {
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
} // end fine-pointer magnetic guard

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
progress.style.cssText = "position:fixed;left:0;top:0;height:3px;width:0;background:linear-gradient(90deg,#00BFA5,#00E5FF);z-index:99999;";
document.body.appendChild(progress);

var progressTicking = false;
window.addEventListener("scroll", function() {
    if (progressTicking) return;
    progressTicking = true;
    requestAnimationFrame(function () {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        var percent = total > 0 ? (window.scrollY / total) * 100 : 0;
        progress.style.width = percent + "%";
        progressTicking = false;
    });
}, { passive: true });

/*==============================
HERO PARALLAX — fine pointers only, rAF throttled
==============================*/

var heroImage = document.querySelector(".hero-image");

if (finePointer) {
    var px = 0, py = 0, pTick = false;
    window.addEventListener("mousemove", function(e) {
        if (!heroImage || window.innerWidth <= 900) return;
        px = (e.clientX / window.innerWidth - 0.5) * 14;
        py = (e.clientY / window.innerHeight - 0.5) * 14;
        if (pTick) return; pTick = true;
        requestAnimationFrame(function () {
            heroImage.style.transform = "translate(" + px + "px," + py + "px)";
            pTick = false;
        });
    }, { passive: true });
}

/*==============================
FLOATING ANIMATION — CSS owns it now; JS nudge desktop only
==============================*/

var floatAngle = 0;
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function floatingAnimation() {
    // CSS keyframes own the float now; keep JS idle for battery.
    // Preserve hook for legacy callers without per-frame layout cost.
    if (reduceMotion) return;
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
                '<div class="cart-item-price">&#2547;' + Cart.formatPrice(item.price) + '</div>' +
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
        cartTotal.textContent = "৳" + Cart.formatPrice(Cart.getTotal());
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

/*==============================
GALLERY LIGHTBOX
==============================*/

(function() {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close gallery">&times;</button>' +
        '<div class="lightbox-fig"><img alt="">' +
        '<div class="lightbox-nav"><button class="lb-btn" id="lbPrev" aria-label="Previous photo">&#8592;</button>' +
        '<span class="lb-count" id="lbCount"></span>' +
        '<button class="lb-btn" id="lbNext" aria-label="Next photo">&#8594;</button></div>' +
        '<p class="lb-cap" id="lbCap"></p></div>';
    document.body.appendChild(lb);

    var img = lb.querySelector("img");
    var cap = lb.querySelector("#lbCap");
    var count = lb.querySelector("#lbCount");
    var list = [];
    var idx = 0;

    function collect() {
        list = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"))
            .filter(function(el) { return el.offsetParent !== null && !el.classList.contains("hide"); });
    }

    function render() {
        var item = list[idx];
        if (!item) return;
        var thumb = item.querySelector("img");
        if (!thumb) return;
        img.src = thumb.currentSrc || thumb.src;
        img.alt = thumb.alt || "";
        cap.textContent = item.getAttribute("data-caption") || thumb.alt || "";
        count.textContent = (idx + 1) + " / " + list.length;
    }

    function openLightbox(item) {
        collect();
        idx = Math.max(0, list.indexOf(item));
        render();
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lb.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(function() { img.removeAttribute("src"); }, 350);
    }

    function step(d) {
        if (!list.length) return;
        idx = (idx + d + list.length) % list.length;
        render();
    }

    document.addEventListener("click", function(e) {
        var item = e.target.closest ? e.target.closest(".gallery-item") : null;
        if (item) openLightbox(item);
    });

    lb.querySelector("#lbPrev").addEventListener("click", function(e) { e.stopPropagation(); step(-1); });
    lb.querySelector("#lbNext").addEventListener("click", function(e) { e.stopPropagation(); step(1); });

    lb.addEventListener("click", function(e) {
        if (e.target === lb || e.target.classList.contains("lightbox-close")) closeLightbox();
    });

    document.addEventListener("keydown", function(e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
    });

    // swipe support (mobile)
    var sx = 0;
    lb.addEventListener("touchstart", function(e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function(e) {
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    }, { passive: true });
})();

/*==============================
REAL GALLERY THEME FILTER (product page)
==============================*/

(function() {
    var bar = document.getElementById("rgFilters");
    var grid = document.getElementById("rgGrid");
    if (!bar || !grid) return;
    var btns = bar.querySelectorAll(".rg-filter");
    var section = document.getElementById("gallery");
    var cards = section ? section.querySelectorAll(".gallery-item") : grid.querySelectorAll(".rg-card");
    btns.forEach(function(b) {
        b.addEventListener("click", function() {
            btns.forEach(function(x) { x.classList.remove("active"); });
            b.classList.add("active");
            var f = b.getAttribute("data-filter");
            cards.forEach(function(c) {
                var show = f === "all" || c.getAttribute("data-theme") === f;
                c.classList.toggle("hide", !show);
                if (show) { c.classList.remove("fade-up", "show"); }
            });
        });
    });
})();

/*==============================
ORDER FORM — AJAX SUBMIT + SUCCESS SCREEN
==============================*/

(function() {
    var form = document.getElementById("ntOrderForm");
    if (!form) return;

    var btn = document.getElementById("orderSubmitBtn");
    var err = document.getElementById("orderFormError");
    var success = document.getElementById("orderSuccess");
    var refEl = document.getElementById("orderRef");
    var head = form.parentElement.querySelector(".ofc-head");
    var sending = false;

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        if (sending) return;
        if (!form.checkValidity()) { form.reportValidity(); return; }

        sending = true;
        if (err) err.hidden = true;
        btn.classList.add("is-loading");
        btn.disabled = true;

        var ref = "INT-" + String(Date.now()).slice(-6);
        var data = new FormData(form);
        data.append("reference", ref);

        fetch(form.action, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
        .then(function(res) {
            if (!res.ok) throw new Error("submit failed");
            if (refEl) refEl.textContent = ref;
            form.hidden = true;
            if (head) head.hidden = true;
            success.hidden = false;
            document.getElementById("orderForm").scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(function() {
            if (err) err.hidden = false;
            btn.classList.remove("is-loading");
            btn.disabled = false;
            sending = false;
        });
    });
})();

/*==============================
MOBILE STICKY ORDER BAR
==============================*/

(function() {
    var bar = document.getElementById("mobileOrderBar");
    if (!bar) return;

    var card = document.getElementById("orderForm");
    var success = document.getElementById("orderSuccess");
    var cta = document.getElementById("mobOrderCta");

    function updateBar() {
        var formInView = false;

        if (card) {
            var r = card.getBoundingClientRect();
            formInView = r.top < window.innerHeight * 0.8 && r.bottom > 140;
        }

        var done = success && !success.hidden;
        var show = window.innerWidth <= 768 && window.scrollY > 420 && !done && !formInView;

        bar.classList.toggle("show", show);
        bar.setAttribute("aria-hidden", show ? "false" : "true");
    }

    if (cta) {
        cta.addEventListener("click", function(e) {
            e.preventDefault();
            if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();
})();

/*==============================
ROYAL CONVERSION ENGINE
countdown · bundles · video · proof · modal · faq · sticky
==============================*/

/*--- 1. COUNTDOWN (rolling 48h launch window, per-visitor) ---*/
(function () {
    var KEY = "nt_deadline_v1";
    var dl = 0;
    try { dl = parseInt(localStorage.getItem(KEY) || "0", 10); } catch (e) {}
    if (!dl || dl < Date.now()) {
        dl = Date.now() + 48 * 3600 * 1000;
        try { localStorage.setItem(KEY, String(dl)); } catch (e) {}
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
        var left = Math.max(0, dl - Date.now());
        var h = Math.floor(left / 3600000), m = Math.floor(left % 3600000 / 60000), s = Math.floor(left % 60000 / 1000);
        document.querySelectorAll("[data-countdown]").forEach(function (box) {
            var eh = box.querySelector("[data-cd-h]"), em = box.querySelector("[data-cd-m]"), es = box.querySelector("[data-cd-s]");
            if (eh) eh.textContent = pad(h);
            if (em) em.textContent = pad(m);
            if (es) es.textContent = pad(s);
        });
    }
    if (document.querySelector("[data-countdown]")) { tick(); setInterval(tick, 1000); }
})();

/*--- 2. BUNDLE SELECTION ---*/
var NT_PACKS = {
    single: { name: "Single · 1× NT-01", short: "Single", qty: 1, mrp: 12499, price: 9999, save: 2500, mrpLabel: "MRP (1 × ৳12,499)", chip: "20% OFF", offer: "Single NT-01 at ৳9,999 (MRP ৳12,499, save ৳2,500)" },
    family: { name: "Family Pack · 3× NT-01", short: "Family Pack", qty: 3, mrp: 37497, price: 28000, save: 9497, mrpLabel: "MRP (3 × ৳12,499)", chip: "FAMILY PACK", offer: "Family Pack 3 for ৳28,000 (MRP ৳37,497, save ৳9,497)" }
};
function ntFormat(n) { return "৳" + n.toLocaleString("en-IN"); }

(function () {
    // Showcase bundle cards (home + product): select updates the section CTA
    ["homeBundles", "productBundles"].forEach(function (id) {
        var wrap = document.getElementById(id);
        if (!wrap) return;
        var cards = wrap.querySelectorAll(".bundle-card");
        var cta = document.getElementById(id === "homeBundles" ? "homeBundleCta" : "productBundleCta");
        cards.forEach(function (c) {
            c.addEventListener("click", function () {
                cards.forEach(function (x) { x.classList.remove("active"); });
                c.classList.add("active");
                if (cta) {
                    var p = NT_PACKS[c.getAttribute("data-pack")] || NT_PACKS.family;
                    cta.href = "/order?pack=" + c.getAttribute("data-pack");
                    cta.firstChild.textContent = (c.getAttribute("data-pack") === "family" ? "Claim Family Pack · ৳28,000 " : "Order Single · ৳9,999 ");
                }
            });
        });
    });
})();

(function () {
    // Order page: full pack state
    var wrap = document.getElementById("orderBundles");
    if (!wrap) return;
    var cards = wrap.querySelectorAll(".bundle-card");
    var sel = document.getElementById("orderQty");
    function qs(name) {
        var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search || "");
        return m ? decodeURIComponent(m[1]) : null;
    }
    function apply(pack) {
        var p = NT_PACKS[pack] || NT_PACKS.family;
        cards.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-pack") === pack); });
        var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
        set("packChip", p.chip);
        set("packName", p.name);
        set("mrpLabel", p.mrpLabel);
        set("mrpValue", ntFormat(p.mrp));
        set("discLabel", pack === "family" ? "Family Pack Discount" : "Launch Discount (20%)");
        set("discValue", "−" + ntFormat(p.save));
        set("payValue", ntFormat(p.price));
        set("submitLabel", (pack === "family" ? "Claim Family Pack · ৳28,000 COD" : "Order Single · ৳9,999 COD"));
        set("mobOld", ntFormat(p.mrp));
        set("mobNew", ntFormat(p.price));
        var fp = document.getElementById("fieldPack"); if (fp) fp.value = p.name;
        var fo = document.getElementById("fieldOffer"); if (fo) fo.value = p.offer;
        var fa = document.getElementById("fieldAmount"); if (fa) fa.value = ntFormat(p.price) + " Cash on Delivery";
        if (sel) sel.value = pack;
        var sp = document.getElementById("successPack"); if (sp) sp.textContent = p.name;
        var sa = document.getElementById("successAmount"); if (sa) sa.textContent = ntFormat(p.price);
    }
    cards.forEach(function (c) {
        c.addEventListener("click", function () { apply(c.getAttribute("data-pack")); });
    });
    if (sel) sel.addEventListener("change", function () { apply(sel.value); });
    var initial = qs("pack") === "single" ? "single" : "family";
    apply(initial);
    window.NT_applyPack = apply;
})();

/*--- 3. SILENT VIDEO LOOPS (always muted, pause off-screen) ---*/
(function () {
    var vids = document.querySelectorAll(".phone-screen video");
    if (!vids.length) return;
    vids.forEach(function (v) {
        v.muted = true;
        v.setAttribute("muted", "");
        v.removeAttribute("controls");
    });
    function playVisible() {
        vids.forEach(function (v) {
            var r = v.getBoundingClientRect();
            var vis = r.top < window.innerHeight * 0.9 && r.bottom > window.innerHeight * 0.1;
            if (vis) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
            else v.pause();
        });
    }
    var tick = false;
    window.addEventListener("scroll", function () {
        if (tick) return; tick = true;
        requestAnimationFrame(function () { playVisible(); tick = false; });
    }, { passive: true });
    playVisible();
})();

/*--- 4. HERO THEME SWITCHER (try all 4 finishes, honest preloaded photos) ---*/
(function () {
    document.querySelectorAll(".hero-theme-bar").forEach(function (bar) {
        var box = bar.parentElement;
        var img = box ? box.querySelector("img") : null;
        var nameEl = box ? box.querySelector(".hero-theme-name b") : null;
        var countEl = box ? box.querySelector(".hero-theme-name span") : null;
        var dots = bar.querySelectorAll(".hero-dot");
        if (!img || !dots.length) return;
        dots.forEach(function (d) { var pre = new Image(); pre.src = d.getAttribute("data-src"); });
        dots.forEach(function (d, n) {
            d.addEventListener("click", function () {
                if (d.classList.contains("active")) return;
                dots.forEach(function (x) { x.classList.remove("active"); });
                d.classList.add("active");
                img.classList.add("fading");
                setTimeout(function () {
                    img.src = d.getAttribute("data-src");
                    img.alt = "Real INTENYTE NT-01 in " + d.getAttribute("data-theme") + " theme on wall";
                    img.onload = function () { img.classList.remove("fading"); };
                    setTimeout(function () { img.classList.remove("fading"); }, 450);
                }, 200);
                if (nameEl) nameEl.textContent = d.getAttribute("data-theme");
                if (countEl) countEl.textContent = (n + 1) + " / " + dots.length;
            });
        });
    });
})();

/*--- 6. FAQ single-open accordion ---*/
(function () {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;
    items.forEach(function (d) {
        d.addEventListener("toggle", function () {
            if (d.open) {
                d.classList.add("active-faq");
                items.forEach(function (o) { if (o !== d && o.open) { o.open = false; o.classList.remove("active-faq"); } });
            } else d.classList.remove("active-faq");
        });
        if (d.open) d.classList.add("active-faq");
    });
})();

/*--- 7. UNIVERSAL STICKY BUY BAR (home + product) ---*/
(function () {
    var bar = document.getElementById("stickyBuy");
    if (!bar) return;
    function update() {
        var show = window.scrollY > 480;
        // hide when final CTA / bundle section is on screen (no need to push)
        var focus = document.getElementById("bundle") || document.querySelector(".booking");
        if (focus && show) {
            var r = focus.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.45) show = false;
        }
        bar.classList.toggle("show", show);
        bar.setAttribute("aria-hidden", show ? "false" : "true");
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
})();
