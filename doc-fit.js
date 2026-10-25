(function () {
  var px = function (v, d) { if (!v) return d; var n = parseFloat(v); if (/in$/.test(v)) return n * 96; if (/mm$/.test(v)) return n * 3.7795; if (/cm$/.test(v)) return n * 37.795; return n || d; };
  var st = document.createElement('style'); st.textContent = '@media print{doc-page{zoom:1 !important}}'; document.head.appendChild(st);
  function fit() {
    document.querySelectorAll('doc-page').forEach(function (dp) {
      var w = px(dp.getAttribute('width'), 8.5 * 96) + 48;
      var aw = document.documentElement.clientWidth;
      dp.style.zoom = aw < w ? Math.max(0.3, aw / w).toFixed(3) : '';
    });
  }
  window.addEventListener('resize', fit);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit); else fit();
  setTimeout(fit, 300);
})();
