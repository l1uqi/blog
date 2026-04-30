"use strict";

(function () {
  // Dark mode toggle
  var toggle = document.getElementById("dark-mode-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var html = document.documentElement;
      var isDark = html.classList.contains("dark");
      html.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "light" : "dark");
    });
  }

  // Mobile menu
  var menuBtn = document.getElementById("mobile-menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Back to top
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 400) {
          backToTop.style.opacity = "1";
          backToTop.style.pointerEvents = "auto";
        } else {
          backToTop.style.opacity = "0";
          backToTop.style.pointerEvents = "none";
        }
      },
      { passive: true }
    );

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Code copy buttons
  if (document.querySelector(".prose pre")) {
    document.querySelectorAll(".prose pre").forEach(function (pre) {
      var btn = document.createElement("button");
      btn.className =
        "code-copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied!";
          setTimeout(function () {
            btn.textContent = "Copy";
          }, 2000);
        });
      });
      pre.style.position = "relative";
      pre.classList.add("group");
      pre.appendChild(btn);
    });
  }
})();
