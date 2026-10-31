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
        var scriptSrc = document.currentScript ? document.currentScript.src : "";
        var siteRoot = scriptSrc ? scriptSrc.slice(0, scriptSrc.lastIndexOf("/") + 1) : "";
        if (!siteRoot) return;
        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.getAttribute("href");
                if (!href || href.charAt(0) !== "/" || href.indexOf("//") === 0) return;
                var hash = "";
                var query = "";
                var path = href;
                var hi = path.indexOf("#");
                if (hi > -1) { hash = path.slice(hi); path = path.slice(0, hi); }
                var qi = path.indexOf("?");
                if (qi > -1) { query = path.slice(qi); path = path.slice(0, qi); }
                if (path === "/" || path === "") { a.setAttribute("href", siteRoot + "index.html" + query + hash); return; }
                if (path.slice(-1) === "/") { a.setAttribute("href", siteRoot + path.slice(1) + "index.html" + query + hash); return; }
                a.setAttribute("href", siteRoot + path.slice(1) + ".html" + query + hash);
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
    function setMenu(open) {
        navLinksMenu.classList.toggle("open", open);
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open);
    }

    menuToggle.addEventListener("click", function() {
        setMenu(!navLinksMenu.classList.contains("open"));
    });

    navLinksMenu.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() { setMenu(false); });
    });

    document.addEventListener("click", function(e) {
        if (!navLinksMenu.classList.contains("open")) return;
        if (navLinksMenu.contains(e.target) || menuToggle.contains(e.target)) return;
        setMenu(false);
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && navLinksMenu.classList.contains("open")) setMenu(false);
    });

    window.addEventListener("resize", function() {
        if (window.innerWidth > 900) setMenu(false);
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
HERO PARALLAX — fine pointers only, rAF throttled
==============================*/

var finePointer = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

var heroImage = document.querySelector(".hero-image");

if (finePointer) {
    var px = 0, py = 0, pTick = false;
    window.addEventListener("mousemove", function(e) {
        if (!heroImage || window.innerWidth <= 900) return;
        px = (e.clientX / window.innerWidth - 0.5) * 14;
        py = (e.clientY / window.innerHeight - 0.5) * 14;
        if (pTick) return; pTick = true;
        requestAnimationFrame(function () {
            heroImage.style.transform = "translate(" + px + "px," + py + "px) scale(1.03)";
            pTick = false;
        });
    }, { passive: true });
}

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
    if (!document.querySelector(".gallery-item")) return;
    var PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close gallery">&times;</button>' +
        '<div class="lightbox-fig"><img alt="" src="' + PLACEHOLDER + '">' +
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
        setTimeout(function() { img.src = PLACEHOLDER; }, 350);
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
            window.dispatchEvent(new Event("scroll"));
            /* Meta Pixel — COD Purchase + Lead (fires once per successful order) */
            try {
                var packSel = document.getElementById("orderQty");
                var packVal = packSel ? packSel.value : "family";
                var packInfo = (typeof NT_PACKS !== "undefined" && NT_PACKS[packVal]) ? NT_PACKS[packVal] : { price: 28000, qty: 3, name: "Family Pack · 3× NT-01" };
                if (typeof fbq !== "undefined") {
                    fbq("track", "Lead", { content_name: packInfo.name, content_category: "COD Order" });
                    fbq("track", "Purchase", { value: packInfo.price, currency: "BDT", content_name: packInfo.name, content_ids: ["nt-01"], content_type: "product", num_items: packInfo.qty });
                }
            } catch (e) {}
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
CONTACT FORM — AJAX SUBMIT
==============================*/

(function() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var btn = document.getElementById("contactSubmitBtn");
    var err = document.getElementById("contactFormError");
    var ok = document.getElementById("contactFormSuccess");
    var sending = false;

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        if (sending) return;
        if (!form.checkValidity()) { form.reportValidity(); return; }

        sending = true;
        if (err) err.hidden = true;
        if (btn) { btn.disabled = true; btn.classList.add("is-loading"); }

        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
        })
        .then(function(res) {
            if (!res.ok) throw new Error("submit failed");
            form.hidden = true;
            if (ok) { ok.hidden = false; ok.scrollIntoView({ behavior: "smooth", block: "center" }); }
        })
        .catch(function() {
            if (err) err.hidden = false;
            if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); }
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
    var footer = document.querySelector(".footer");

    function updateBar() {
        var formInView = false;

        if (card) {
            var r = card.getBoundingClientRect();
            formInView = r.top < window.innerHeight * 0.8 && r.bottom > 140;
        }

        var footerInView = false;
        if (footer) {
            var f = footer.getBoundingClientRect();
            footerInView = f.top < window.innerHeight;
        }

        var done = success && !success.hidden;
        var show = window.innerWidth <= 768 && window.scrollY > 420 && !done && !formInView && !footerInView;

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
bundles · video · theme · faq
==============================*/

/*--- 1. BUNDLE SELECTION ---*/
var NT_PACKS = {
    single: { name: "Single · 1× NT-01", short: "Single", qty: 1, list: 9999, price: 9999, save: 0, mrpLabel: "NT-01 × 1", chip: "SINGLE", offer: "Single NT-01 at ৳9,999" },
    family: { name: "Family Pack · 3× NT-01", short: "Family Pack", qty: 3, list: 29997, price: 28000, save: 1997, mrpLabel: "3 × NT-01", chip: "FAMILY PACK", offer: "Family Pack: 3 NT-01 for ৳28,000 (save ৳1,997 vs 3 singles)" }
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
        set("mrpValue", ntFormat(p.list));
        set("discLabel", "Family Pack saving");
        set("discValue", "−" + ntFormat(p.save));
        var saveRow = document.getElementById("packSaveRow");
        if (saveRow) saveRow.hidden = !p.save;
        set("payValue", ntFormat(p.price));
        set("submitLabel", (pack === "family" ? "Claim Family Pack · ৳28,000 COD" : "Order Single · ৳9,999 COD"));
        var mobOld = document.getElementById("mobOld");
        if (mobOld) { mobOld.textContent = ntFormat(p.list); mobOld.hidden = !p.save; }
        var mobOff = document.getElementById("mobOff");
        if (mobOff) mobOff.textContent = p.save ? "SAVE " + ntFormat(p.save) : "SINGLE";
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
        if (!bar.getClientRects().length) return;
        var box = bar.parentElement;
        var img = box ? (box.querySelector(".hero-image") || box.querySelector("img")) : null;
        var blur = box ? box.querySelector(".hero-image-blur") : null;
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
                    if (blur) blur.src = d.getAttribute("data-src");
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

/*==============================
META PIXEL — BUTTON CLICK EVENTS
AddToCart when shopper picks a pack / clicks order CTA
==============================*/
(function () {
    function pixelAddToCart(pack, value) {
        try {
            if (typeof fbq !== "undefined") {
                fbq("track", "AddToCart", {
                    content_name: pack || "INTENYTE NT-01",
                    content_ids: ["nt-01"],
                    content_type: "product",
                    value: value || 9999,
                    currency: "BDT"
                });
            }
        } catch (e) {}
    }
    document.addEventListener("click", function (e) {
        var bundle = e.target.closest ? e.target.closest(".bundle-card") : null;
        if (bundle) {
            var p = bundle.getAttribute("data-pack");
            var info = (typeof NT_PACKS !== "undefined" && NT_PACKS[p]) ? NT_PACKS[p] : null;
            pixelAddToCart(info ? info.name : p, info ? info.price : 9999);
            return;
        }
        var orderLink = e.target.closest ? e.target.closest('a[href^="/order"], a[href^="order.html"], a[href*="orderForm"]') : null;
        if (orderLink) {
            pixelAddToCart("INTENYTE NT-01", 9999);
        }
    });
})();
