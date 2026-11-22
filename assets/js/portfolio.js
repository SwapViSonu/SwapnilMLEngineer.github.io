/* Swapnil Sawant — AI Engineer Portfolio
   Vanilla JS: navigation, scroll spy, reveal, project filters, copy email. */
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  var header = doc.querySelector(".site-header");
  var navToggle = doc.querySelector(".nav-toggle");
  var navLinks = doc.querySelector(".nav-links");
  var toTop = doc.querySelector(".to-top");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header + back to top ---------- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 12);
    if (toTop) toTop.classList.toggle("visible", y > 640);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  function closeNav() {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      var icon = navToggle.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    }
  }

  function toggleNav() {
    var open = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    var icon = navToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-times", open);
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }

  if (navLinks) {
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
  }

  doc.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeNav();
  });

  /* ---------- Scroll spy ---------- */
  var spyLinks = Array.prototype.slice.call(
    doc.querySelectorAll(".nav-links a[href^='#']")
  );
  var spyMap = {};
  var spySections = [];

  spyLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = doc.getElementById(id);
    if (section) {
      spyMap[id] = link;
      spySections.push(section);
    }
  });

  if ("IntersectionObserver" in window && spySections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spyLinks.forEach(function (link) {
            link.classList.remove("active");
          });
          var active = spyMap[entry.target.id];
          if (active) active.classList.add("active");
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    spySections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealItems = Array.prototype.slice.call(
    doc.querySelectorAll("[data-reveal]")
  );

  revealItems.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var siblings = Array.prototype.filter.call(parent.children, function (child) {
      return child.hasAttribute("data-reveal");
    });
    var index = siblings.indexOf(el);
    el.style.setProperty(
      "--reveal-delay",
      Math.min(index, 5) * 65 + "ms"
    );
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Project filters ---------- */
  var filterButtons = Array.prototype.slice.call(
    doc.querySelectorAll(".filter-btn")
  );
  var projectCards = Array.prototype.slice.call(
    doc.querySelectorAll(".project-card")
  );
  var projectCount = doc.getElementById("project-count");

  function applyFilter(filter) {
    var shown = 0;

    projectCards.forEach(function (card) {
      var categories = (card.getAttribute("data-category") || "").split(" ");
      var match = filter === "all" || categories.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });

    filterButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-filter") === filter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (projectCount) {
      projectCount.textContent =
        "Showing " + shown + " of " + projectCards.length + " public projects";
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.getAttribute("data-filter"));
    });
  });

  /* ---------- Copy email ---------- */
  var copyButton = doc.querySelector(".copy-btn");

  function legacyCopy(text) {
    var field = doc.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    doc.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = doc.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    doc.body.removeChild(field);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-email") || "";
      var label = copyButton.querySelector("span");
      var icon = copyButton.querySelector("i");
      var original = label ? label.textContent : "";

      function confirmCopy(ok) {
        copyButton.classList.toggle("copied", ok);
        if (label) label.textContent = ok ? "Copied" : "Copy failed";
        if (icon) {
          icon.classList.toggle("fa-check", ok);
          icon.classList.toggle("fa-copy", !ok);
        }
        window.setTimeout(function () {
          copyButton.classList.remove("copied");
          if (label) label.textContent = original;
          if (icon) {
            icon.classList.add("fa-copy");
            icon.classList.remove("fa-check");
          }
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () {
            confirmCopy(true);
          },
          function () {
            confirmCopy(legacyCopy(email));
          }
        );
      } else {
        confirmCopy(legacyCopy(email));
      }
    });
  }

  /* ---------- Back to top ---------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
