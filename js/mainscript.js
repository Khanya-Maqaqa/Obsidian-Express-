
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "R" + n.toFixed(2); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /*Scroll reveal and back to top behavior*/
  function initReveal() {
    var els = $$("section > h2, section > h1, .dish-card, .dish-detail, .team-card, .menu-item, .accordion-item");
    els.forEach(function (el) { el.classList.add("reveal"); });
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  function initBackToTop() {
    var btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "&uarr;";
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /*Accordions*/
  function initAccordions() {
    $$(".accordion").forEach(function (acc) {
      $$(".accordion-trigger", acc).forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          var open = trigger.getAttribute("aria-expanded") === "true";
          // close the others so only one panel is open at a time
          $$(".accordion-trigger", acc).forEach(function (t) {
            t.setAttribute("aria-expanded", "false");
            document.getElementById(t.getAttribute("aria-controls")).style.maxHeight = null;
          });
          if (!open) {
            var panel = document.getElementById(trigger.getAttribute("aria-controls"));
            trigger.setAttribute("aria-expanded", "true");
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      });
    });
  }

  /*Tabs functionality*/
  function initTabs() {
    $$(".tabs").forEach(function (wrap) {
      var tabs = $$('[role="tab"]', wrap);
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on);
          t.tabIndex = on ? 0 : -1;
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.hidden = !on;
        });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          var n = null;
          if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
          if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (n) { n.focus(); select(n); }
        });
      });
    });
  }

  /*Lightbox behavior*/
  var lightbox = { el: null, imgs: [], idx: 0 };
  function buildLightbox() {
    var el = document.createElement("div");
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Image viewer");
    el.hidden = true;
    el.innerHTML =
      '<button class="lb-close" type="button" aria-label="Close image">&times;</button>' +
      '<button class="lb-prev" type="button" aria-label="Previous image">&#10094;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-next" type="button" aria-label="Next image">&#10095;</button>';
    document.body.appendChild(el);
    lightbox.el = el;
    $(".lb-close", el).addEventListener("click", closeLightbox);
    $(".lb-prev", el).addEventListener("click", function () { showLightbox(lightbox.idx - 1); });
    $(".lb-next", el).addEventListener("click", function () { showLightbox(lightbox.idx + 1); });
    el.addEventListener("click", function (e) { if (e.target === el) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (el.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLightbox(lightbox.idx - 1);
      if (e.key === "ArrowRight") showLightbox(lightbox.idx + 1);
    });
  }
  function showLightbox(i) {
    var n = lightbox.imgs.length;
    lightbox.idx = (i + n) % n;
    var src = lightbox.imgs[lightbox.idx];
    var img = $("img", lightbox.el);
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    $("figcaption", lightbox.el).textContent = src.alt;
    lightbox.el.hidden = false;
    document.body.classList.add("no-scroll");
    $(".lb-close", lightbox.el).focus();
  }
  function closeLightbox() {
    lightbox.el.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lightbox.opener) lightbox.opener.focus();
  }
  function initLightbox() {
    var imgs = $$("[data-lightbox], .dish-detail img, .gallery img");
    if (!imgs.length) return;
    buildLightbox();
    lightbox.imgs = imgs;
    imgs.forEach(function (img, i) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.classList.add("zoomable");
      var open = function () { lightbox.opener = img; showLightbox(i); };
      img.addEventListener("click", open);
      img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  /*Modal functionality*/
  var modal = { el: null };
  function buildModal() {
    var el = document.createElement("div");
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "modal-title");
    el.hidden = true;
    el.innerHTML = '<div class="modal-box"><button class="modal-close" type="button" aria-label="Close dialog">&times;</button><div class="modal-body"></div></div>';
    document.body.appendChild(el);
    modal.el = el;
    $(".modal-close", el).addEventListener("click", closeModal);
    el.addEventListener("click", function (e) { if (e.target === el) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !el.hidden) closeModal(); });
  }
  function openModal(html, opener) {
    if (!modal.el) buildModal();
    $(".modal-body", modal.el).innerHTML = html;
    modal.opener = opener;
    modal.el.hidden = false;
    document.body.classList.add("no-scroll");
    $(".modal-close", modal.el).focus();
  }
  function closeModal() {
    modal.el.hidden = true;
    document.body.classList.remove("no-scroll");
    if (modal.opener) modal.opener.focus();
  }

  /*Menu data user search*/
  function loadMenu() {
    return fetch("data/menu.json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function () {
        if (window.OBSIDIAN_MENU) return window.OBSIDIAN_MENU;
        throw new Error("Menu data unavailable");
      });
  }

  /*Load menu data, fi;ter through menu and display results*/
  function initMenuPage() {
    var grid = $("#menu-results");
    if (!grid) return;
    var search = $("#menu-search"), sort = $("#menu-sort"), count = $("#menu-count");
    var chips = $$(".chip");
    var state = { cat: "all", q: "", sort: "default", items: [] };

    grid.innerHTML = '<p class="status">Loading menu&hellip;</p>';
    loadMenu().then(function (items) { state.items = items; render(); })
      .catch(function () { grid.innerHTML = '<p class="status error">Sorry, the menu could not be loaded. Please refresh the page.</p>'; });

    function render() {
      var q = state.q.trim().toLowerCase();
      var list = state.items.filter(function (it) {
        var inCat = state.cat === "all" || it.category === state.cat;
        var hay = (it.name + " " + it.description + " " + it.tags.join(" ") + " " + it.categoryLabel).toLowerCase();
        return inCat && (!q || hay.indexOf(q) !== -1);
      });
      if (state.sort === "az") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (state.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === "high") list.sort(function (a, b) { return b.price - a.price; });

      count.textContent = list.length + (list.length === 1 ? " dish found" : " dishes found");
      if (!list.length) {
        grid.innerHTML = '<p class="status">No dishes match &ldquo;' + esc(state.q) + '&rdquo;. Try &ldquo;chicken&rdquo;, &ldquo;spicy&rdquo; or &ldquo;street food&rdquo;.</p>';
        return;
      }
      grid.innerHTML = list.map(function (it) {
        return '<article class="menu-item visible">' +
          '<img src="images/' + esc(it.image) + '" alt="' + esc(it.alt) + '" loading="lazy" width="500" height="500">' +
          '<div class="menu-item-body"><span class="badge">' + esc(it.categoryLabel) + '</span>' +
          '<h3>' + esc(it.name) + '</h3>' +
          '<p class="price">' + money(it.price) + '</p>' +
          '<button type="button" class="btn btn-small" data-id="' + esc(it.id) + '">View details</button></div></article>';
      }).join("");
    }

    search.addEventListener("input", function () { state.q = search.value; render(); });
    sort.addEventListener("change", function () { state.sort = sort.value; render(); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        state.cat = c.dataset.cat; render();
      });
    });
    $("#menu-reset").addEventListener("click", function () {
      search.value = ""; sort.value = "default"; state.q = ""; state.sort = "default"; state.cat = "all";
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.cat === "all"); });
      render();
    });
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]");
      if (!b) return;
      var it = state.items.filter(function (x) { return x.id === b.dataset.id; })[0];
      openModal(
        '<img src="images/' + esc(it.image) + '" alt="' + esc(it.alt) + '">' +
        '<h2 id="modal-title">' + esc(it.name) + '</h2>' +
        '<p class="price">' + money(it.price) + '</p>' +
        '<p>' + esc(it.description) + '</p>' +
        '<p><strong>Available:</strong> ' + esc(it.availability) + '</p>' +
        '<a class="btn" href="enquiry.html?item=' + encodeURIComponent(it.id) + '">Enquire about this dish</a>', b);
    });
  }

  /*Shared form helpers*/
  function setError(field, msg) {
    var group = field.closest(".form-group");
    var err = $(".error-msg", group);
    if (!err) { err = document.createElement("span"); err.className = "error-msg"; err.id = field.id + "-error"; group.appendChild(err); }
    err.textContent = msg;
    group.classList.toggle("invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) field.setAttribute("aria-describedby", err.id); else field.removeAttribute("aria-describedby");
    return !msg;
  }
  var phoneRe = /^(?:\+27|0)[1-9][0-9]{8}$/;           // South African numbers
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var nameRe = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F' -]{1,59}$/;

  var rules = {
    name: function (v) {
      if (!v.trim()) return "Please enter your full name.";
      if (!nameRe.test(v.trim())) return "Names may only contain letters, spaces, hyphens and apostrophes (2-60 characters).";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Please enter your email address.";
      if (!emailRe.test(v.trim())) return "Enter a valid email address, e.g. you@example.com.";
      return "";
    },
    phone: function (v, required) {
      var clean = v.replace(/[\s-]/g, "");
      if (!clean) return required ? "Please enter your phone number." : "";
      if (!phoneRe.test(clean)) return "Enter a valid South African number, e.g. 076 206 1064 or +27 76 206 1064.";
      return "";
    }
  };

  function liveValidate(form, validators) {
    Object.keys(validators).forEach(function (id) {
      var f = document.getElementById(id);
      if (!f) return;
      var run = function () { return setError(f, validators[id](f.value, f)); };
      f.addEventListener("blur", run);
      f.addEventListener("input", function () { if (f.closest(".form-group").classList.contains("invalid")) run(); });
    });
    return function () {
      var ok = true, first = null;
      Object.keys(validators).forEach(function (id) {
        var f = document.getElementById(id);
        if (!f) return;
        if (!setError(f, validators[id](f.value, f))) { ok = false; first = first || f; }
      });
      if (first) first.focus();
      return ok;
    };
  }

  function charCounter(field, max) {
    var c = document.createElement("span");
    c.className = "char-count";
    field.closest(".form-group").appendChild(c);
    var upd = function () { c.textContent = field.value.length + " / " + max; };
    field.addEventListener("input", upd); upd();
  }

  /*Enquiry form functionality*/
  function initEnquiry() {
    var form = $("#enquiry-form");
    if (!form) return;
    var itemSel = $("#item"), menu = [];
    var dateInput = $("#date");
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function iso(d) { return d.toISOString().slice(0, 10); }
    dateInput.min = iso(today);
    var maxDate = new Date(today); maxDate.setFullYear(maxDate.getFullYear() + 1);
    dateInput.max = iso(maxDate);
    charCounter($("#notes"), 300);

    loadMenu().then(function (items) {
      menu = items;
      var groups = {};
      items.forEach(function (it) { (groups[it.categoryLabel] = groups[it.categoryLabel] || []).push(it); });
      Object.keys(groups).forEach(function (g) {
        var og = document.createElement("optgroup"); og.label = g;
        groups[g].forEach(function (it) {
          var o = document.createElement("option");
          o.value = it.id; o.textContent = it.name + " (" + money(it.price) + ")";
          og.appendChild(o);
        });
        itemSel.appendChild(og);
      });
      var pre = new URLSearchParams(location.search).get("item");
      if (pre) itemSel.value = pre;
    }).catch(function () {
      showResult('<p class="status error">The menu could not be loaded, so quotes are unavailable. Please use the contact form instead.</p>');
    });

    var check = liveValidate(form, {
      name: rules.name, email: rules.email,
      phone: function (v) { return rules.phone(v, true); },
      type: function (v) { return v ? "" : "Please choose the type of enquiry."; },
      item: function (v) { return v ? "" : "Please choose a dish."; },
      quantity: function (v) {
        if (v === "") return "Please enter a quantity.";
        var n = Number(v);
        if (!Number.isInteger(n) || n < 1 || n > 500) return "Quantity must be a whole number from 1 to 500.";
        return "";
      },
      date: function (v) {
        if (!v) return "Please choose a date.";
        var d = new Date(v + "T00:00:00");
        if (isNaN(d)) return "Enter a valid date.";
        if (d < today) return "The date cannot be in the past.";
        if (d > maxDate) return "Please choose a date within the next 12 months.";
        return "";
      },
      notes: function (v) { return v.length > 300 ? "Notes must be 300 characters or fewer." : ""; }
    });

    function showResult(html) {
      var box = $("#result");
      box.innerHTML = html;
      box.hidden = false;
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check()) return;
      var btn = $("button[type=submit]", form);
      btn.disabled = true; btn.textContent = "Calculating\u2026";
      // Asynchronous processing - no page reload (AJAX-style)
      loadMenu().then(function (items) {
        var it = items.filter(function (x) { return x.id === itemSel.value; })[0];
        var qty = Number($("#quantity").value);
        var type = $("#type").value;
        var date = new Date($("#date").value + "T00:00:00");
        var subtotal = it.price * qty;
        var discPct = qty >= 50 ? 10 : qty >= 10 ? 5 : 0;
        var discount = subtotal * discPct / 100;
        var delivery = type === "catering" ? 150 : 0;
        var total = subtotal - discount + delivery;

        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var dow = days[date.getDay()];
        var notes = [], available = true;
        if (it.availability === "Fri-Sun" && [0, 5, 6].indexOf(date.getDay()) === -1) {
          available = false;
          notes.push(it.name + " is only served Friday to Sunday. Please choose a Friday, Saturday or Sunday.");
        }
        var daysAhead = Math.round((date - today) / 86400000);
        if (type === "catering" && daysAhead < 2) {
          available = false;
          notes.push("Catering orders need at least 48 hours\u2019 notice.");
        }
        if (qty > 100 && type !== "catering") {
          available = false;
          notes.push("Orders above 100 portions must be booked as catering.");
        }
        var typeLabel = { dinein: "Dine-in / takeaway", catering: "Event catering", bulk: "Bulk office order" }[type];
        var ref = "OBS-" + date.getFullYear().toString().slice(2) + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + "-" + Math.floor(1000 + Math.random() * 9000);

        var html = '<h3>' + (available ? "Good news, " : "Almost there, ") + esc($("#name").value.trim().split(" ")[0]) + '!</h3>' +
          '<p class="status ' + (available ? "ok" : "error") + '">' + (available ? "Available on " + dow + " " + date.toLocaleDateString("en-ZA") : "Not available as requested") + '</p>' +
          (notes.length ? "<ul class='notes'>" + notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" : "") +
          '<table class="quote"><tbody>' +
          '<tr><th>Enquiry type</th><td>' + esc(typeLabel) + '</td></tr>' +
          '<tr><th>Dish</th><td>' + esc(it.name) + ' &times; ' + qty + '</td></tr>' +
          '<tr><th>Unit price</th><td>' + money(it.price) + '</td></tr>' +
          '<tr><th>Subtotal</th><td>' + money(subtotal) + '</td></tr>' +
          (discPct ? '<tr><th>Bulk discount (' + discPct + '%)</th><td>&minus;' + money(discount) + '</td></tr>' : "") +
          (delivery ? '<tr><th>Catering delivery</th><td>' + money(delivery) + '</td></tr>' : "") +
          '<tr class="total"><th>Estimated total</th><td>' + money(total) + '</td></tr></tbody></table>' +
          '<p class="small">Reference: <strong>' + ref + '</strong>. This is an estimate; a team member will confirm by email at ' + esc($("#email").value.trim()) + '.</p>' +
          '<a class="btn" href="contact.html">Questions? Contact us</a>';
        showResult(html);
      }).catch(function () {
        showResult('<p class="status error">Sorry, something went wrong calculating your quote. Please try again.</p>');
      }).then(function () { btn.disabled = false; btn.textContent = "Get my quote"; });
    });

    form.addEventListener("reset", function () {
      $("#result").hidden = true;
      $$(".form-group.invalid", form).forEach(function (g) { g.classList.remove("invalid"); });
      $$(".error-msg", form).forEach(function (m) { m.textContent = ""; });
    });
  }

  /*Contact form functionality*/
  function initContact() {
    var form = $("#contact-form");
    if (!form) return;
    var RECIPIENT = "info@obsidianexpress.com";
    charCounter($("#message"), 1000);
    var check = liveValidate(form, {
      name: rules.name, email: rules.email,
      phone: function (v) { return rules.phone(v, false); },
      topic: function (v) { return v ? "" : "Please choose the type of message."; },
      subject: function (v) {
        if (!v.trim()) return "Please enter a subject.";
        if (v.trim().length < 3 || v.trim().length > 80) return "Subject must be 3 to 80 characters.";
        return "";
      },
      message: function (v) {
        var l = v.trim().length;
        if (!l) return "Please type your message.";
        if (l < 20) return "Your message is a little short \u2013 please write at least 20 characters.";
        if (l > 1000) return "Message must be 1000 characters or fewer.";
        return "";
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check()) return;
      var topic = $("#topic").options[$("#topic").selectedIndex].text;
      var subject = "[" + topic + "] " + $("#subject").value.trim();
      var phone = $("#phone").value.trim();
      var body = "Hello Obsidian Express,\n\n" + $("#message").value.trim() +
        "\n\n--\nName: " + $("#name").value.trim() +
        "\nEmail: " + $("#email").value.trim() +
        (phone ? "\nPhone: " + phone : "") +
        "\nMessage type: " + topic;
      var href = "mailto:" + RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      var box = $("#contact-result");
      box.innerHTML = '<h3>Your email is ready</h3><p class="status ok">Thank you, ' + esc($("#name").value.trim().split(" ")[0]) +
        '! Your details are valid. Review the email below, then press &ldquo;Send email&rdquo; to open it in your email app.</p>' +
        '<dl class="email-preview"><dt>To</dt><dd>' + esc(RECIPIENT) + '</dd><dt>Subject</dt><dd>' + esc(subject) +
        '</dd><dt>Message</dt><dd class="pre">' + esc(body) + '</dd></dl>' +
        '<a class="btn" id="send-email" href="' + esc(href) + '">Send email</a> ' +
        '<button type="button" class="btn btn-ghost" id="edit-msg">Edit message</button>';
      box.hidden = false;
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      $("#edit-msg").addEventListener("click", function () { box.hidden = true; $("#message").focus(); });
    });

    form.addEventListener("reset", function () {
      $("#contact-result").hidden = true;
      $$(".form-group.invalid", form).forEach(function (g) { g.classList.remove("invalid"); });
      $$(".error-msg", form).forEach(function (m) { m.textContent = ""; });
    });
  }

  /*leaflet map functionality*/
  function initMap() {
    var el = $("#map");
    if (!el || !window.L) return;
    var pos = [-26.19204, 28.03374];
    var map = L.map(el, { scrollWheelZoom: false }).setView(pos, 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    L.marker(pos).addTo(map)
      .bindPopup("<strong>Obsidian Express</strong><br>50 Stiemens Street, Floor 8<br>Braamfontein").openPopup();
    // allow wheel zoom only after the user clicks the map (avoids scroll-trapping)
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    $$(".map-link").forEach(function (a) {
      a.href = "https://www.openstreetmap.org/directions?to=" + pos.join("%2C");
    });
  }

  /*Boot*/
  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initBackToTop();
    initAccordions();
    initTabs();
    initLightbox();
    initMenuPage();
    initEnquiry();
    initContact();
    initMap();
  });
})();
