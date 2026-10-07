// weantech.com — shared behavior: mobile nav, reveal on scroll, mesh drift
// Mesh tinted brass to match the WeanTech accent.
(function(){
  "use strict";

  // ── Mobile nav ──
  var nav = document.getElementById('siteNav');
  var btn = document.getElementById('navToggle');
  if (nav && btn) {
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.getElementById('navLinks').addEventListener('click', function(e){
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Reveal on scroll ──
  var reveal = document.querySelectorAll('.panel, .principle, .block, .cta-card');
  if (!('IntersectionObserver' in window)) {
    reveal.forEach(function(el){ el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: .1 });
    reveal.forEach(function(el){ io.observe(el); });
  }

  // ── Mesh network drift (brass) ──
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var c = document.getElementById('mesh');
  if (!c) return;
  var ctx = c.getContext('2d');
  var W, H, nodes = [], packets = [];
  var LINK = 150, MAXN = 60;

  function reset(){
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    nodes = [];
    packets = [];
    var n = Math.min(MAXN, Math.floor(W * H / 26000));
    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .28,
        vy: (Math.random() - .5) * .28,
        r: 1 + Math.random() * 1.6,
        pulse: 0
      });
    }
  }
  reset();
  window.addEventListener('resize', reset);

  function spawnPacket(){
    for (var t = 0; t < 10; t++) {
      var a = nodes[(Math.random() * nodes.length) | 0];
      var b = nodes[(Math.random() * nodes.length) | 0];
      if (!a || !b || a === b) continue;
      var dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy < LINK * LINK) {
        packets.push({ a: a, b: b, t: 0 });
        a.pulse = 1;
        return;
      }
    }
  }
  setInterval(function(){
    if (packets.length < 6 && Math.random() > .35) spawnPacket();
  }, 800);

  function frame(){
    ctx.clearRect(0, 0, W, H);

    var i, j, p;
    for (i = 0; i < nodes.length; i++) {
      p = nodes[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      if (p.pulse > 0) p.pulse -= .025;
    }

    for (i = 0; i < nodes.length; i++) {
      for (j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          var alpha = (1 - Math.sqrt(d2) / LINK) * .13;
          ctx.strokeStyle = 'rgba(200,169,110,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (var k = packets.length - 1; k >= 0; k--) {
      var pk = packets[k];
      pk.t += .022;
      if (pk.t >= 1) { pk.b.pulse = 1; packets.splice(k, 1); continue; }
      var x = pk.a.x + (pk.b.x - pk.a.x) * pk.t;
      var y = pk.a.y + (pk.b.y - pk.a.y) * pk.t;
      ctx.fillStyle = 'rgba(200,169,110,.75)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 6.3);
      ctx.fill();
    }

    for (i = 0; i < nodes.length; i++) {
      p = nodes[i];
      var glow = p.pulse > 0 ? p.pulse : 0;
      ctx.fillStyle = 'rgba(200,169,110,' + (.32 + glow * .6).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + glow * 2.2, 0, 6.3);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  frame();
})();
