"use strict";

(async function () {
  var container = document.getElementById("pretext-archive-flow");
  if (!container) return;

  var sections = document.querySelectorAll(".archive-year");
  if (!sections.length) return;

  let prepare, layout;
  try {
    var mod = await import(
      "https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm"
    );
    prepare = mod.prepare;
    layout = mod.layout;
  } catch {
    // Fallback: just use CSS transitions
    enableCSSFallback();
    return;
  }

  // Pre-calculate heights for smooth transitions
  var font = "16px JetBrains Mono";
  sections.forEach(function (section) {
    var items = section.querySelectorAll("li");
    items.forEach(function (item) {
      var text = item.textContent || "";
      try {
        var prepared = prepare(text.trim(), font);
        var result = layout(prepared, section.offsetWidth, 24);
        item.style.setProperty("--pretext-height", result.height + "px");
      } catch {
        // Non-critical
      }
    });
  });

  // Add smooth collapse/expand on year headers
  sections.forEach(function (section) {
    var heading = section.querySelector("h2");
    var list = section.querySelector("ul");
    if (!heading || !list) return;

    heading.style.cursor = "pointer";
    heading.setAttribute("role", "button");
    heading.setAttribute("aria-expanded", "true");

    heading.addEventListener("click", function () {
      var isExpanded = heading.getAttribute("aria-expanded") === "true";
      heading.setAttribute("aria-expanded", String(!isExpanded));
      if (isExpanded) {
        list.style.maxHeight = list.scrollHeight + "px";
        list.offsetHeight; // force reflow
        list.style.maxHeight = "0";
        list.style.overflow = "hidden";
      } else {
        list.style.maxHeight = list.scrollHeight + "px";
        list.style.overflow = "";
        list.addEventListener(
          "transitionend",
          function () {
            list.style.maxHeight = "";
          },
          { once: true }
        );
      }
    });

    list.style.transition = "max-height 0.3s ease";
  });

  function enableCSSFallback() {
    sections.forEach(function (section) {
      var heading = section.querySelector("h2");
      var list = section.querySelector("ul");
      if (!heading || !list) return;

      heading.style.cursor = "pointer";
      heading.setAttribute("role", "button");
      heading.setAttribute("aria-expanded", "true");

      heading.addEventListener("click", function () {
        var isExpanded = heading.getAttribute("aria-expanded") === "true";
        heading.setAttribute("aria-expanded", String(!isExpanded));
        list.style.display = isExpanded ? "none" : "";
      });
    });
  }
})();
