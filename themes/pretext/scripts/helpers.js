/* hexo-theme-pretext custom helpers */

"use strict";

hexo.extend.helper.register("strip_html", function (content) {
  return content ? content.replace(/<[^>]*>/g, "") : "";
});

hexo.extend.helper.register("reading_time", function (content) {
  var text = content ? content.replace(/<[^>]*>/g, "") : "";
  var cjk = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || [])
    .length;
  var words = text
    .replace(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  // CJK: ~300 chars/min, Latin: ~200 words/min
  var minutes = Math.ceil(cjk / 300 + words / 200);
  return Math.max(1, minutes);
});
