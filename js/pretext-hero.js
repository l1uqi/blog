"use strict";

(async function () {
  var canvas = document.getElementById("pretext-hero-canvas");
  if (!canvas) return;

  var fallback = document.getElementById("pretext-hero-fallback");
  var font = canvas.dataset.font || "14px JetBrains Mono";

  // --- Multiple bunny ASCII arts ---
  var BUNNIES = [
    // #1 Bug bunny (by bug)
    [
      "                              __       ",
      "                     /\\    .-\" /       ",
      "                    /  ; .'  .'        ",
      "                   :   :/  .'          ",
      "                    \\  ;-.'            ",
      "       .--\"\"\"\"--..__ /     `.          ",
      "     .'           .'    `o  \\          ",
      "    /                    `   ;         ",
      "   :                  \\      :         ",
      " .-;        -.         `.__.-'         ",
      ":  ;          \\     ,   ;              ",
      "'._:           ;   :   (               ",
      "    \\/  .__    ;    \\   `-.            ",
      " bug ;     \"-,/_..--\"`-..__)          ",
      '     \'""--.._ :                        ',
    ],
    // #2 Standing bunny with long ears
    [
      "     / \\                    ",
      "    / _ \\                   ",
      "   | / \\ |                  ",
      "   ||   || _______          ",
      "   ||   || |\\     \\         ",
      "   ||   || ||\\     \\        ",
      "   ||   || || \\    |        ",
      "   ||   || ||  \\__/         ",
      "   ||   || ||   ||          ",
      "    \\\\_/ \\_/ \\_//           ",
      "   /   _     _   \\         ",
      "  /               \\        ",
      "  |    O     O    |        ",
      "  |   \\  ___  /   |        ",
      " /     \\ \\_/ /     \\       ",
      "/  -----  |  -----  \\      ",
      "|     \\__/|\\__/     |      ",
      "\\       |_|_|       /      ",
      " \\_____       _____/       ",
      "       \\     /              ",
      "       |     |              ",
    ],
    // #3 Star bunny
    [
      "   ***                      ",
      "  ** **                     ",
      " **   **                    ",
      " **   **         ****      ",
      " **   **       **   ****   ",
      " **  **       *   **   **  ",
      "  **  *      *  **  ***  **",
      "   **  *    *  **     **  *",
      "    ** **  ** **        ** ",
      "    **   **  **            ",
      "   *           *           ",
      "  *             *          ",
      " *    0     0    *         ",
      " *   /   @   \\   *        ",
      " *   \\__/ \\__/   *        ",
      "   *     W     *           ",
      "     **     **             ",
      "       *****               ",
    ],
    // #4 Sparkle bunny (original tall)
    [
      "                      /|      __        ",
      "*             +      / |   ,-~ /        ",
      "     .              Y :|  //  /         ",
      "         .          | jj /( .^     *    ",
      "               *    >-\"~\"-v\"            ",
      "*                  /       Y            ",
      "   .     .        jo  o    |     .      ",
      "                 ( ~T~     j            ",
      "      +           >._-' _./         +  ",
      "               /| ;-\"~ _  l             ",
      "  .           / l/ ,-\"~    \\     +      ",
      "              \\//\\/      .- \\            ",
      "       +       Y        /    Y          ",
      "               l       I     !          ",
      "               ]\\      _\\    /\"\\        ",
      "              (\" ~----( ~   Y.  )       ",
      "          ~~~~~~~~~~~~~~~~~~~~~~~~~~    ",
    ],
  ];

  // Pick a random bunny
  var bunnyLines = BUNNIES[Math.floor(Math.random() * BUNNIES.length)];

  var prepareWithSegments;
  try {
    var mod = await import(
      "https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm"
    );
    prepareWithSegments = mod.prepareWithSegments;
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
  var getSecondary = function () {
    return isDark() ? "#8A8A8A" : "#6B6B6B";
  };

  var BASE_LINE_H = 16;
  var lineH = BASE_LINE_H;
  var activeFont = font;
  var chars = [];
  var animFrame;
  var canvasHeight = 0;

  // --- Mouse interaction ---
  var targetIntensity = 0;
  var currentIntensity = 0;
  var mouseIdleTimer = null;
  var IDLE_TIMEOUT = 1500;

  document.addEventListener(
    "mousemove",
    function () {
      if (targetIntensity < 2) targetIntensity = 1;
      clearTimeout(mouseIdleTimer);
      mouseIdleTimer = setTimeout(function () {
        if (targetIntensity === 1) targetIntensity = 0;
      }, IDLE_TIMEOUT);
    },
    { passive: true }
  );

  canvas.addEventListener("mouseenter", function () {
    targetIntensity = 2;
    clearTimeout(mouseIdleTimer);
  }, { passive: true });

  canvas.addEventListener("mouseleave", function () {
    targetIntensity = 1;
    mouseIdleTimer = setTimeout(function () {
      targetIntensity = 0;
    }, IDLE_TIMEOUT);
  }, { passive: true });

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    var width = rect.width;

    // Compute required height from bunny dimensions
    var baseFontSize = parseInt(font) || 14;
    ctx.font = baseFontSize + "px JetBrains Mono";
    var baseCharW = ctx.measureText("M").width;
    var maxLen = 0;
    for (var i = 0; i < bunnyLines.length; i++) {
      if (bunnyLines[i].length > maxLen) maxLen = bunnyLines[i].length;
    }
    var neededWidth = maxLen * baseCharW;
    var availWidth = width - 24;
    var scale = neededWidth > availWidth ? availWidth / neededWidth : 1;
    var scaledLineH = Math.round(BASE_LINE_H * scale);
    var artHeight = bunnyLines.length * scaledLineH;
    var VERT_PAD = 40;
    canvasHeight = Math.max(artHeight + VERT_PAD * 2, 200);

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = canvasHeight + "px";
    // Also set the parent height so layout adjusts
    canvas.parentElement.style.height = canvasHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildChars(width);
  }

  function buildChars(width) {
    chars = [];

    // Find widest line
    var maxLen = 0;
    for (var i = 0; i < bunnyLines.length; i++) {
      if (bunnyLines[i].length > maxLen) maxLen = bunnyLines[i].length;
    }

    // Auto-scale font to fit width with padding
    var baseFontSize = parseInt(font) || 14;
    var testFont = baseFontSize + "px JetBrains Mono";
    ctx.font = testFont;
    var baseCharW = ctx.measureText("M").width;
    var neededWidth = maxLen * baseCharW;
    var availWidth = width - 24; // padding
    var scale = 1;
    if (neededWidth > availWidth) {
      scale = availWidth / neededWidth;
    }
    var fontSize = Math.max(9, Math.floor(baseFontSize * scale));
    activeFont = fontSize + "px JetBrains Mono";
    lineH = Math.round(BASE_LINE_H * (fontSize / baseFontSize));

    ctx.font = activeFont;
    var charW = ctx.measureText("M").width;
    var totalArtHeight = bunnyLines.length * lineH;
    var startY = (canvasHeight - totalArtHeight) / 2;
    var artWidth = maxLen * charW;
    var startX = (width - artWidth) / 2;

    // Detect special characters for coloring
    // Face chars: eyes (O, o, 0, @), wave (~), sparkle (*, +, .)
    for (var li = 0; li < bunnyLines.length; li++) {
      var line = bunnyLines[li];
      try {
        prepareWithSegments(line, activeFont);
      } catch { /* non-critical */ }

      for (var ci = 0; ci < line.length; ci++) {
        var ch = line[ci];
        if (ch === " ") continue;

        var isSpecial = false;
        var isWave = ch === "~" && li >= bunnyLines.length - 2;
        var isSparkle = (ch === "*" || ch === "+" || ch === ".");

        // Detect face region: look for eye-like chars
        if ((ch === "O" || ch === "o" || ch === "0" || ch === "@") && !isSparkle) {
          isSpecial = true;
        }

        chars.push({
          ch: ch,
          baseX: startX + ci * charW,
          baseY: startY + li * lineH,
          lineIndex: li,
          charIndex: ci,
          isWave: isWave,
          isFace: isSpecial,
          isSparkle: isSparkle,
        });
      }
    }
  }

  function animate(time) {
    currentIntensity += (targetIntensity - currentIntensity) * 0.04;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = activeFont;
    ctx.textBaseline = "top";

    var color = getColor();
    var accent = getAccent();
    var secondary = getSecondary();

    var t = currentIntensity;
    var ampY = 0.3 + t * 1.8;
    var ampX = 0.1 + t * 0.6;
    var speed = 0.0003 + t * 0.0005;
    var alphaBase = 0.8 - t * 0.12;
    var alphaRange = 0.15 + t * 0.15;

    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      var phase = time * speed + c.lineIndex * 0.25 + c.charIndex * 0.08;
      var dx = Math.cos(phase * 0.7) * ampX;
      var dy = Math.sin(phase) * ampY;
      var alpha = alphaBase + alphaRange * Math.sin(phase + 0.5);

      if (c.isWave) {
        dy = Math.sin(time * (0.0008 + t * 0.001) + c.charIndex * 0.3) * (0.5 + t * 2.0);
        alpha = alphaBase + alphaRange * Math.sin(time * 0.001 + c.charIndex * 0.3);
      }

      if (currentIntensity > 1.5) {
        var scatter = (currentIntensity - 1.5) * 2;
        dx += Math.cos(phase * 1.3) * scatter * 2;
        dy += Math.sin(phase * 1.1) * scatter * 1.5;
      }

      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.fillStyle = c.isFace ? accent : (c.isWave || c.isSparkle) ? secondary : color;
      ctx.fillText(c.ch, c.baseX + dx, c.baseY + dy);
    }

    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(animate);
  }

  function showFallback() {
    canvas.style.display = "none";
    if (fallback) {
      fallback.classList.remove("hidden");
      fallback.classList.add("flex");
    }
  }

  var ro = new ResizeObserver(function () {
    if (animFrame) cancelAnimationFrame(animFrame);
    resize();
    animFrame = requestAnimationFrame(animate);
  });
  ro.observe(canvas.parentElement);

  resize();
  animFrame = requestAnimationFrame(animate);

  new MutationObserver(function () {}).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
