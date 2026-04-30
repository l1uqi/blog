"use strict";

(async function () {
  var canvas = document.getElementById("pretext-404-canvas");
  if (!canvas) return;

  var fallback = document.getElementById("pretext-404-fallback");
  var artType = canvas.dataset.art || "cat";

  let prepareWithSegments, layoutWithLines;
  try {
    var mod = await import(
      "https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm"
    );
    prepareWithSegments = mod.prepareWithSegments;
    layoutWithLines = mod.layoutWithLines;
  } catch {
    showFallback();
    return;
  }

  var ctx = canvas.getContext("2d");
  if (!ctx) {
    showFallback();
    return;
  }

  var isDark = function () {
    return document.documentElement.classList.contains("dark");
  };
  var getColor = function () {
    return isDark() ? "#E0DED8" : "#1A1A1A";
  };
  var getAccent = function () {
    return isDark() ? "#E8563A" : "#3acce8";
  };

  // ASCII art patterns
  var arts = {
    cat: [
      "  /\\_/\\  ",
      " ( o.o ) ",
      "  > ^ <  ",
      " /|   |\\",
      "(_|   |_)",
    ],
    mountain: [
      "        /\\        ",
      "       /  \\       ",
      "      /    \\      ",
      "     / /\\   \\     ",
      "    / /  \\   \\    ",
      "   / /    \\   \\   ",
      "  /  ------\\   \\  ",
      " /          \\   \\ ",
      "/____________\\___\\",
    ],
    maze: [
      "+--+--+--+--+",
      "|     |     |",
      "+  +--+  +  +",
      "|  |     |  |",
      "+  +  +--+  +",
      "|     |     |",
      "+--+--+--+--+",
    ],
  };

  var artLines = arts[artType] || arts.cat;
  var text = artLines.join("\n");
  var font = "14px JetBrains Mono";

  var dpr = window.devicePixelRatio || 1;
  var chars = [];
  var mouseX = -1000;
  var mouseY = -1000;

  function setup() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var w = Math.min(rect.width, 500);
    canvas.width = w * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = "300px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    chars = [];
    try {
      var prepared = prepareWithSegments(text, font);
      var result = layoutWithLines(prepared, w - 20, 20);
      var startY = (300 - result.height) / 2;

      result.lines.forEach(function (line, li) {
        var lineX = (w - line.width) / 2;
        var lineY = startY + li * 20;
        for (var i = 0; i < line.text.length; i++) {
          var ch = line.text[i];
          if (ch === " ") continue;
          var charW = line.width / Math.max(line.text.length, 1);
          chars.push({
            ch: ch,
            baseX: lineX + i * charW,
            baseY: lineY,
            x: lineX + i * charW,
            y: lineY,
          });
        }
      });
    } catch {
      showFallback();
    }
  }

  function animate() {
    var w = canvas.width / dpr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = font;
    ctx.textBaseline = "top";

    var color = getColor();
    var accent = getAccent();
    var repelRadius = 80;

    chars.forEach(function (c) {
      var dx = c.baseX - mouseX;
      var dy = c.baseY - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var targetX = c.baseX;
      var targetY = c.baseY;

      if (dist < repelRadius && dist > 0) {
        var force = (1 - dist / repelRadius) * 30;
        targetX = c.baseX + (dx / dist) * force;
        targetY = c.baseY + (dy / dist) * force;
      }

      // Smooth interpolation
      c.x += (targetX - c.x) * 0.15;
      c.y += (targetY - c.y) * 0.15;

      var charDist = Math.sqrt(
        Math.pow(c.x - c.baseX, 2) + Math.pow(c.y - c.baseY, 2)
      );
      ctx.fillStyle = charDist > 2 ? accent : color;
      ctx.globalAlpha = 1;
      ctx.fillText(c.ch, c.x, c.y);
    });

    requestAnimationFrame(animate);
  }

  function showFallback() {
    canvas.style.display = "none";
    if (fallback) {
      fallback.classList.remove("hidden");
      fallback.classList.add("block");
    }
  }

  canvas.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener("mouseleave", function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Touch support
  canvas.addEventListener(
    "touchmove",
    function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    },
    { passive: true }
  );

  canvas.addEventListener("touchend", function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  var ro = new ResizeObserver(function () {
    setup();
  });
  ro.observe(canvas.parentElement);

  setup();
  requestAnimationFrame(animate);
})();
