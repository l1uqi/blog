"use strict";

(async function () {
  var container = document.getElementById("pretext-reflow-container");
  if (!container) return;

  // --- Config ---
  var rawText = (container.dataset.text || "").replace(/\r\n/g, "\n").trim();

  // Auto-detect CJK content
  var cjkCount = (rawText.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  var isCJK = cjkCount > rawText.length * 0.1;

  var FONT_SIZE = isCJK ? 16 : 16;
  var LINE_HEIGHT = isCJK ? 32 : 28;
  var FONT = isCJK
    ? FONT_SIZE + 'px "Noto Serif SC", "Noto Serif JP", serif'
    : FONT_SIZE + "px JetBrains Mono";
  var PADDING = 24;
  var EXCLUSION_PADDING = 12;
  var PARAGRAPH_GAP = LINE_HEIGHT * 1.2;

  // --- Emoji pool & limits ---
  var EMOJI_POOL = ["\u{1F430}", "\u{1F353}", "\u{1F411}", "\u{1F4D6}", "\u{1F95B}", "\u{1F9CA}", "\u26C4\uFE0F", "\u{1F340}", "\u{1F98C}", "\u{1F9B7}"];
  var MAX_DRAGGABLES = 10;

  function makeDraggable(emoji, fontSize, radius, x, y, showHint) {
    return {
      emoji: emoji,
      fontSize: fontSize,
      radius: radius,
      x: x,
      y: y,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      hint: showHint ? "drag me!" : "",
      hintVisible: showHint,
      glowColor: function (dark) {
        return dark ? "rgba(232,86,58,0.15)" : "rgba(194,59,34,0.1)";
      },
    };
  }

  // --- Draggable objects (vary by color mode) ---
  var dark = document.documentElement.classList.contains("dark"); 
  var draggables = dark
    ? [
        makeDraggable("\u{1F430}", 48, 36, 0, 0, true),
        makeDraggable("\u{1F353}", 36, 26, 0, 0, true),
      ]
    : [
        makeDraggable("\u{1F95B}", 36, 26, 0, 0, true),
        makeDraggable("\u{1F9CA}", 36, 26, 0, 0, true),
      ];

  // --- Elements ---
  var canvas = document.getElementById("pretext-reflow-canvas");
  var domLayer = document.getElementById("pretext-reflow-dom");
  var toggleBtn = document.getElementById("pretext-reflow-toggle");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  // --- Load pretext ---
  var pretext;
  try {
    pretext = await import(
      "https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm"
    );
  } catch (e) {
    console.warn("Failed to load pretext:", e);
    container.classList.add("pretext-reflow-fallback");
    return;
  }

  // --- Text content: split into paragraphs ---
  var paragraphs = rawText.split(/\n\n+/).filter(function (p) {
    return p.trim().length > 0;
  });

  // --- Prepare each paragraph ---
  var preparedParas = [];
  function prepareParagraphs() {
    preparedParas = [];
    for (var i = 0; i < paragraphs.length; i++) {
      try {
        preparedParas.push(
          pretext.prepareWithSegments(paragraphs[i].trim(), FONT)
        );
      } catch (e) {
        console.warn("prepare paragraph " + i + " failed:", e);
        preparedParas.push(null);
      }
    }
  }

  // --- State ---
  var isDark = function () {
    return document.documentElement.classList.contains("dark");
  };
  var canvasMode = true;
  var contentWidth = 0;
  var contentHeight = 600;
  var dpr = window.devicePixelRatio || 1;
  var animFrame = null;

  // --- Colors ---
  function colors() {
    var dark = isDark();
    return {
      bg: dark ? "#121212" : "#FAFAF8",
      text: dark ? "#E0DED8" : "#1A1A1A",
      secondary: dark ? "#8A8A8A" : "#6B6B6B",
      accent: dark ? "#E8563A" : "#3acce8",
    };
  }

  // --- Resize ---
  function resize() {
    var rect = container.getBoundingClientRect();
    contentWidth = rect.width;

    canvas.width = contentWidth * dpr;
    canvas.height = contentHeight * dpr;
    canvas.style.width = contentWidth + "px";
    canvas.style.height = contentHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Default positions (only on first load)
    if (draggables[0].x === 0 && draggables[0].y === 0) {
      draggables[0].x = contentWidth * 0.65;
      draggables[0].y = 140;
    }
    if (draggables[1].x === 0 && draggables[1].y === 0) {
      draggables[1].x = contentWidth * 0.3;
      draggables[1].y = 460;
    }
  }

  // --- Core: multi-paragraph, multi-object reflow ---
  function layoutAndRender() {
    if (!canvasMode) return;

    var c = colors();
    var dark = isDark();

    // Clear
    ctx.clearRect(0, 0, contentWidth + 1, contentHeight + 1);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, contentWidth, contentHeight);

    ctx.font = FONT;
    ctx.textBaseline = "top";

    var maxW = contentWidth - PADDING * 2;
    var startX = PADDING;
    var y = PADDING;

    // Layout each paragraph
    for (var pi = 0; pi < preparedParas.length; pi++) {
      var prepared = preparedParas[pi];
      if (!prepared) continue;

      var cursor = { segmentIndex: 0, graphemeIndex: 0 };
      var lineCount = 0;
      var MAX_LINES = 200;

      while (lineCount < MAX_LINES) {
        var lineTop = y;
        var lineBot = y + LINE_HEIGHT;

        // Collect all exclusion zones for this line from all draggables
        var exclusions = [];
        for (var di = 0; di < draggables.length; di++) {
          var d = draggables[di];
          var R = d.radius + EXCLUSION_PADDING;
          if (circleIntersectsHBand(d.x, d.y, R, lineTop, lineBot)) {
            var exc = circleHorizontalExclusion(
              d.x,
              d.y,
              R,
              lineTop,
              lineBot,
              startX,
              startX + maxW
            );
            if (exc) exclusions.push(exc);
          }
        }

        if (exclusions.length > 0) {
          // Merge overlapping exclusions and sort
          var merged = mergeExclusions(exclusions);
          // Build available segments
          var segments = buildAvailableSegments(
            startX,
            startX + maxW,
            merged
          );

          var anyText = false;
          for (var si = 0; si < segments.length; si++) {
            var seg = segments[si];
            var segWidth = seg.right - seg.left;
            if (segWidth < FONT_SIZE * 2) continue;

            var line = pretext.layoutNextLine(prepared, cursor, segWidth);
            if (!line) break;
            drawLine(ctx, line, seg.left, y, c);
            cursor = line.end;
            anyText = true;
          }
          // If no segment had text (all too narrow), just advance y
        } else {
          // Normal full-width line
          var line = pretext.layoutNextLine(prepared, cursor, maxW);
          if (!line) break;
          drawLine(ctx, line, startX, y, c);
          cursor = line.end;
        }

        y += LINE_HEIGHT;
        lineCount++;

        // Check if paragraph is done
        if (isTextConsumed(prepared, cursor)) break;
      }

      // Paragraph gap
      if (pi < preparedParas.length - 1) {
        y += PARAGRAPH_GAP;
      }
    }

    // Grow canvas if needed
    var totalHeight = y + PADDING + 60;
    if (Math.abs(totalHeight - contentHeight) > 50) {
      contentHeight = totalHeight;
      canvas.height = contentHeight * dpr;
      canvas.style.height = contentHeight + "px";
      container.style.minHeight = contentHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutAndRender();
      return;
    }

    // Draw all draggable objects (on top of text)
    for (var di = 0; di < draggables.length; di++) {
      drawDraggable(ctx, draggables[di], c, dark);
    }
  }

  // --- Check if all text in a prepared segment is consumed ---
  function isTextConsumed(prepared, cursor) {
    if (cursor.segmentIndex > prepared.segments.length - 1) return true;
    if (
      cursor.segmentIndex === prepared.segments.length - 1 &&
      cursor.graphemeIndex >=
        prepared.segments[prepared.segments.length - 1].length
    )
      return true;
    return false;
  }

  // --- Merge overlapping exclusion zones ---
  function mergeExclusions(exclusions) {
    exclusions.sort(function (a, b) {
      return a.left - b.left;
    });
    var merged = [{ left: exclusions[0].left, right: exclusions[0].right }];
    for (var i = 1; i < exclusions.length; i++) {
      var last = merged[merged.length - 1];
      if (exclusions[i].left <= last.right) {
        last.right = Math.max(last.right, exclusions[i].right);
      } else {
        merged.push({
          left: exclusions[i].left,
          right: exclusions[i].right,
        });
      }
    }
    return merged;
  }

  // --- Build available text segments from exclusions ---
  function buildAvailableSegments(areaLeft, areaRight, exclusions) {
    var segments = [];
    var x = areaLeft;
    for (var i = 0; i < exclusions.length; i++) {
      if (exclusions[i].left > x) {
        segments.push({ left: x, right: exclusions[i].left });
      }
      x = Math.max(x, exclusions[i].right);
    }
    if (x < areaRight) {
      segments.push({ left: x, right: areaRight });
    }
    return segments;
  }

  // --- Draw a laid-out line ---
  function drawLine(ctx, line, x, y, c) {
    ctx.fillStyle = c.text;
    ctx.font = FONT;
    var text = line.text;
    var charX = x;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var w = ctx.measureText(ch).width;
      ctx.fillText(ch, charX, y + (LINE_HEIGHT - FONT_SIZE) / 2);
      charX += w;
    }
  }

  // --- Draw a draggable object ---
  function drawDraggable(ctx, d, c, dark) {
    // Glow
    ctx.save();
    var gradient = ctx.createRadialGradient(
      d.x,
      d.y,
      d.radius * 0.3,
      d.x,
      d.y,
      d.radius * 1.8
    );
    gradient.addColorStop(0, d.glowColor(dark));
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Emoji
    ctx.save();
    ctx.font = d.fontSize + "px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.emoji, d.x, d.y);
    ctx.restore();

    // Hint
    if (d.hintVisible) {
      ctx.save();
      ctx.font = "11px JetBrains Mono";
      ctx.fillStyle = c.secondary;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(d.hint, d.x, d.y + d.radius + 6);
      ctx.restore();
    }
  }

  // --- Circle-band intersection ---
  function circleIntersectsHBand(cx, cy, r, top, bot) {
    var closestY = Math.max(top, Math.min(cy, bot));
    return Math.abs(cy - closestY) < r;
  }

  function circleHorizontalExclusion(cx, cy, r, top, bot, areaLeft, areaRight) {
    var maxHalf = 0;
    var steps = [top, (top + bot) / 2, bot];
    for (var i = 0; i < steps.length; i++) {
      var dy = steps[i] - cy;
      var sq = r * r - dy * dy;
      if (sq > 0) {
        var half = Math.sqrt(sq);
        if (half > maxHalf) maxHalf = half;
      }
    }
    if (maxHalf <= 0) return null;

    var left = cx - maxHalf;
    var right = cx + maxHalf;
    if (right < areaLeft || left > areaRight) return null;

    return {
      left: Math.max(areaLeft, left),
      right: Math.min(areaRight, right),
    };
  }

  // --- Drag events (multi-object) ---
  var activeDrag = null;

  function getEventPos(e) {
    var rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function findDraggable(pos) {
    // Check in reverse so topmost (last drawn) is picked first
    for (var i = draggables.length - 1; i >= 0; i--) {
      var d = draggables[i];
      var dx = pos.x - d.x;
      var dy = pos.y - d.y;
      if (dx * dx + dy * dy <= d.radius * d.radius * 1.8) {
        return d;
      }
    }
    return null;
  }

  function onPointerDown(e) {
    if (!canvasMode) return;
    var pos = getEventPos(e);
    var d = findDraggable(pos);
    if (d) {
      activeDrag = d;
      d.dragging = true;
      d.offsetX = pos.x - d.x;
      d.offsetY = pos.y - d.y;
      d.hintVisible = false;
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (!canvasMode) return;
    var pos = getEventPos(e);
    if (activeDrag) {
      activeDrag.x = Math.max(
        activeDrag.radius,
        Math.min(contentWidth - activeDrag.radius, pos.x - activeDrag.offsetX)
      );
      activeDrag.y = Math.max(
        activeDrag.radius,
        Math.min(contentHeight - activeDrag.radius, pos.y - activeDrag.offsetY)
      );
      scheduleRender();
      e.preventDefault();
    } else {
      canvas.style.cursor = findDraggable(pos) ? "grab" : "default";
    }
  }

  function onPointerUp() {
    if (activeDrag) {
      activeDrag.dragging = false;
      activeDrag = null;
    }
    canvas.style.cursor = "default";
  }

  // --- Throttled render ---
  function scheduleRender() {
    if (animFrame) return;
    animFrame = requestAnimationFrame(function () {
      animFrame = null;
      layoutAndRender();
    });
  }

  // --- Toggle Canvas / DOM ---
  function toggleMode() {
    canvasMode = !canvasMode;
    if (canvasMode) {
      canvas.style.display = "block";
      container.style.minHeight = contentHeight + "px";
      domLayer.style.display = "none";
      toggleBtn.textContent = "\u{1F4CB} Select Text";
      scheduleRender();
    } else {
      canvas.style.display = "none";
      container.style.minHeight = "0";
      domLayer.style.display = "block";
      toggleBtn.textContent = "\u2728 Interactive";
    }
    updateAddBtn();
  }

  // --- Init ---
  prepareParagraphs();
  resize();
  layoutAndRender(); // synchronous first paint

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("touchstart", onPointerDown, { passive: false });
  canvas.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleMode);
  }

  // --- Add emoji button ---
  var addBtn = document.getElementById("pretext-reflow-add");
  function updateAddBtn() {
    if (!addBtn) return;
    if (!canvasMode || draggables.length >= MAX_DRAGGABLES) {
      addBtn.style.opacity = "0.4";
      addBtn.style.pointerEvents = "none";
    } else {
      addBtn.style.opacity = "1";
      addBtn.style.pointerEvents = "auto";
    }
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (!canvasMode || draggables.length >= MAX_DRAGGABLES) return;

      // Pick a random emoji not already present
      var used = {};
      for (var i = 0; i < draggables.length; i++) {
        used[draggables[i].emoji] = true;
      }
      var available = [];
      for (var i = 0; i < EMOJI_POOL.length; i++) {
        if (!used[EMOJI_POOL[i]]) available.push(EMOJI_POOL[i]);
      }
      if (available.length === 0) {
        // All used, allow duplicates
        available = EMOJI_POOL.slice();
      }
      var emoji = available[Math.floor(Math.random() * available.length)];

      // Random position within content area
      var margin = 60;
      var rx = margin + Math.random() * (contentWidth - margin * 2);
      var ry = margin + Math.random() * Math.min(contentHeight - margin * 2, 400);

      draggables.push(makeDraggable(emoji, 36, 26, rx, ry, false));
      updateAddBtn();
      scheduleRender();
    });
    updateAddBtn();
  }

  var ro = new ResizeObserver(function () {
    resize();
    layoutAndRender(); // synchronous — no blank frame between clear and draw
  });
  ro.observe(container);

  new MutationObserver(function () {
    layoutAndRender(); // synchronous for dark mode switch too
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
