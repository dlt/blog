// Manual light/dark toggle. The initial theme is resolved pre-paint by an
// inline script in <head>; this only handles user toggles and persistence.
(function () {
  "use strict";

  var root = document.documentElement;

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
    });
  }

  function init() {
    var btns = document.querySelectorAll(".theme-toggle");
    btns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(current() === "dark"));
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });

    // Follow OS changes only when the user has not made an explicit choice.
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        var stored;
        try { stored = localStorage.getItem("theme"); } catch (err) {}
        if (stored !== "light" && stored !== "dark") {
          root.setAttribute("data-theme", e.matches ? "dark" : "light");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
