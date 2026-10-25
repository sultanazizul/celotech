/* Ucup & Oyen: low-poly 3D duo for the Celotechan hero. Needs THREE (r128) on window. */
(function () {
  var host = document.getElementById('duo3d');
  if (!host) return;
  var bubble = document.getElementById('bubble3d');
  if (!window.THREE) { host.classList.add('no3d'); return; }
  var T = window.THREE;

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { host.classList.add('no3d'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  var canvas = renderer.domElement;
  canvas.className = 'duo-canvas';
  canvas.setAttribute('aria-label', 'Ucup dan Oyen dalam 3D. Geser untuk memutar, ketuk untuk menyapa.');
  canvas.setAttribute('role', 'img');
  host.appendChild(canvas);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idle = reduce ? 0.25 : 1;

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(27, 1, 0.1, 100);
  var LOOK = new T.Vector3(0, 1.25, 0);

  scene.add(new T.HemisphereLight(0xfff4e2, 0x9a7a52, 0.62));
  var sun = new T.DirectionalLight(0xfff1dc, 0.7);
  sun.position.set(4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  var sc = sun.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 25;
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  var fill = new T.DirectionalLight(0xd6e4ff, 0.28);
  fill.position.set(-6, 3, 3);
  scene.add(fill);

  var C = {
    skin: 0xc98552, hair: 0x35211a, hoodie: 0xf2c12e, shorts: 0x2c3a58, sandal: 0x3d8fe0,
    black: 0x1c1a1a, white: 0xffffff, orange: 0xe8912f, stripe: 0xcc6f1f, cream: 0xeedcb8,
    pink: 0xe79aa4, collar: 0xd8343a, eye: 0xf2d64a, wood: 0xb48a58, woodDark: 0x8a6a42,
    pot: 0xc8602e, leaf: 0x3fa45b, leaf2: 0x2f8c4a, blush: 0xf08a7a
  };
  var mats = {};
  function M(c) {
    if (!mats[c]) mats[c] = new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.86, metalness: 0 });
    return mats[c];
  }
  function add(geo, color, x, y, z, parent, noShadow) {
    var m = new T.Mesh(geo, typeof color === 'number' ? M(color) : color);
    m.position.set(x, y, z);
    if (!noShadow) { m.castShadow = true; m.receiveShadow = true; }
    parent.add(m);
    return m;
  }
  function group(x, y, z, parent) {
    var g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function tube(points, r, color, parent) {
    var curve = new T.CatmullRomCurve3(points.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
    return add(new T.TubeGeometry(curve, 24, r, 6, false), color, 0, 0, 0, parent);
  }

  var stage = new T.Group();
  scene.add(stage);

  /* Wooden toy stage */
  add(new T.CylinderGeometry(3.25, 3.4, 0.34, 12), C.wood, 0, -0.17, 0, stage).castShadow = false;
  add(new T.CylinderGeometry(3.45, 3.45, 0.16, 12), C.woodDark, 0, -0.41, 0, stage).castShadow = false;

  /* Potted plant, as in the episode sets */
  var plant = group(-2.3, 0, -1.25, stage);
  add(new T.CylinderGeometry(0.34, 0.26, 0.56, 7), C.pot, 0, 0.28, 0, plant);
  add(new T.IcosahedronGeometry(0.5, 0), C.leaf, 0, 0.95, 0, plant);
  add(new T.IcosahedronGeometry(0.34, 0), C.leaf2, 0.32, 0.78, 0.12, plant);
  add(new T.IcosahedronGeometry(0.3, 0), C.leaf, -0.3, 0.8, -0.05, plant);

  /* A stack of books for Oyen's side */
  var books = group(2.35, 0, -1.25, stage);
  add(new T.BoxGeometry(0.9, 0.16, 0.62), 0x3b8fe8, 0, 0.08, 0, books);
  add(new T.BoxGeometry(0.82, 0.16, 0.58), 0xd8343a, 0.03, 0.24, 0.02, books).rotation.y = 0.12;
  add(new T.BoxGeometry(0.76, 0.16, 0.54), 0x4db34d, -0.02, 0.4, 0, books).rotation.y = -0.1;

  /* ---------- Ucup ---------- */
  var ucup = group(-0.95, 0, 0.25, stage);
  ucup.rotation.y = 0.28;
  ucup.userData.who = 'ucup';
  var ucupBody = group(0, 0, 0, ucup);

  [-1, 1].forEach(function (s) {
    add(new T.BoxGeometry(0.26, 0.08, 0.44), C.sandal, s * 0.2, 0.04, 0.05, ucupBody);
    add(new T.CylinderGeometry(0.1, 0.1, 0.44, 6), C.skin, s * 0.2, 0.29, 0, ucupBody);
  });
  add(new T.CylinderGeometry(0.42, 0.47, 0.34, 10), C.shorts, 0, 0.6, 0, ucupBody);
  var torso = add(new T.SphereGeometry(0.62, 10, 8), C.hoodie, 0, 1.12, 0, ucupBody);
  torso.scale.set(1, 1.05, 0.82);
  add(new T.TorusGeometry(0.36, 0.14, 6, 12), C.hoodie, 0, 1.72, 0, ucupBody).rotation.x = Math.PI / 2;

  /* "404" print on the hoodie */
  (function () {
    var cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
    var g = cv.getContext('2d');
    g.fillStyle = '#5b4a14'; g.font = '800 92px "Plus Jakarta Sans", Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('404', 128, 70);
    var tex = new T.CanvasTexture(cv);
    var mat = new T.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
    var p = new T.Mesh(new T.PlaneGeometry(0.46, 0.23), mat);
    p.position.set(0, 1.04, 0.512);
    ucupBody.add(p);
  })();

  var arms = [];
  [-1, 1].forEach(function (s) {
    var a = group(s * 0.55, 1.46, 0, ucupBody);
    a.rotation.z = s * 0.38;
    add(new T.CylinderGeometry(0.135, 0.12, 0.62, 6), C.hoodie, 0, -0.3, 0, a);
    add(new T.SphereGeometry(0.14, 6, 5), C.skin, 0, -0.64, 0.02, a);
    a.userData.base = s * 0.38;
    arms.push(a);
  });

  var uHead = group(0, 1.74, 0, ucupBody);
  var skull = add(new T.SphereGeometry(0.9, 14, 10), C.skin, 0, 0.72, 0, uHead);
  skull.scale.set(1, 0.95, 0.95);
  var hair1 = add(new T.SphereGeometry(0.95, 14, 10, 0, Math.PI * 2, 0, 1.4), C.hair, 0, 0.74, -0.03, uHead);
  hair1.rotation.x = -0.15;
  var hair2 = add(new T.SphereGeometry(0.935, 12, 8, 0, Math.PI * 2, 0, 1.25), C.hair, 0, 0.72, -0.02, uHead);
  hair2.rotation.x = -1.15;
  var swoop = add(new T.BoxGeometry(0.5, 0.12, 0.32), C.hair, 0.42, 1.18, 0.6, uHead);
  swoop.rotation.set(0.5, -0.5, -0.55);
  var antenna = group(0, 1.55, -0.05, uHead);
  tube([[0, 0, 0], [0.02, 0.28, -0.02], [0.12, 0.52, 0], [0.3, 0.56, 0], [0.38, 0.42, 0]], 0.045, C.hair, antenna);

  [-1, 1].forEach(function (s) {
    add(new T.SphereGeometry(0.17, 6, 5), C.skin, s * 0.88, 0.66, 0, uHead).scale.set(0.6, 1, 1);
  });

  var uEyes = [];
  [-1, 1].forEach(function (s) {
    var e = group(s * 0.31, 0.66, 0.78, uHead);
    add(new T.SphereGeometry(0.19, 10, 8), C.white, 0, 0, 0, e, true).scale.set(1, 1.1, 0.5);
    add(new T.SphereGeometry(0.1, 8, 6), C.black, 0.02, -0.01, 0.08, e, true).scale.set(1, 1.15, 0.5);
    add(new T.SphereGeometry(0.035, 5, 4), C.white, 0.05, 0.05, 0.13, e, true);
    uEyes.push(e);
    var lens = add(new T.TorusGeometry(0.27, 0.052, 6, 18), C.black, s * 0.32, 0.67, 0.9, uHead);
    lens.scale.set(1, 1, 0.8);
    var arm = add(new T.BoxGeometry(0.045, 0.045, 0.62), C.black, s * 0.66, 0.69, 0.52, uHead);
    arm.rotation.y = s * 0.32;
    var brow = add(new T.BoxGeometry(0.24, 0.055, 0.06), C.hair, s * 0.32, 1.0, 0.82, uHead, true);
    brow.rotation.z = s > 0 ? 0.22 : -0.08;
    if (s > 0) brow.position.y += 0.04;
    var blush = new T.Mesh(new T.CircleGeometry(0.085, 10), new T.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.55 }));
    blush.position.set(s * 0.46, 0.42, 0.74); blush.rotation.y = s * 0.55;
    uHead.add(blush);
  });
  add(new T.CylinderGeometry(0.028, 0.028, 0.13, 5), C.black, 0, 0.7, 0.93, uHead).rotation.z = Math.PI / 2;
  var mouth = add(new T.TorusGeometry(0.1, 0.024, 4, 10, Math.PI), C.black, 0.06, 0.36, 0.84, uHead, true);
  mouth.rotation.z = Math.PI;

  /* ---------- Oyen ---------- */
  var oyen = group(1.2, 0, 0.1, stage);
  oyen.rotation.y = -0.32;
  oyen.userData.who = 'oyen';
  var oyenBody = group(0, 0, 0, oyen);

  var belly = add(new T.SphereGeometry(0.78, 12, 9), C.orange, 0, 0.74, 0, oyenBody);
  belly.scale.set(1, 0.95, 0.9);
  [2.35, 2.75, 3.3, 3.8, 0.0, 0.45, 5.6].forEach(function (phi) {
    var st = add(new T.SphereGeometry(0.79, 12, 9, phi, 0.2, 0.35, 1.5), C.stripe, 0, 0.74, 0, oyenBody, true);
    st.scale.set(1, 0.95, 0.9);
  });
  add(new T.SphereGeometry(0.48, 10, 8), C.cream, 0, 0.56, 0.5, oyenBody).scale.set(1, 1.12, 0.55);
  [-1, 1].forEach(function (s) {
    add(new T.SphereGeometry(0.17, 7, 5), C.cream, s * 0.24, 0.08, 0.66, oyenBody).scale.set(1, 0.6, 1.3);
    add(new T.SphereGeometry(0.21, 7, 5), C.cream, s * 0.62, 0.1, 0.38, oyenBody).scale.set(1, 0.6, 1.3);
  });
  add(new T.TorusGeometry(0.42, 0.055, 5, 16), C.collar, 0, 1.3, 0.02, oyenBody).rotation.x = Math.PI / 2 - 0.12;
  add(new T.BoxGeometry(0.13, 0.15, 0.04), C.black, 0, 1.19, 0.45, oyenBody).rotation.x = -0.15;

  var tail = group(0.5, 0.16, -0.42, oyenBody);
  tube([[0, 0, 0], [0.32, 0.02, 0.08], [0.56, 0.1, 0.36], [0.54, 0.24, 0.66]], 0.1, C.orange, tail);
  add(new T.SphereGeometry(0.1, 6, 5), C.stripe, 0.54, 0.24, 0.66, tail);

  var oHead = group(0, 1.3, 0.06, oyenBody);
  add(new T.SphereGeometry(0.64, 14, 10), C.orange, 0, 0.45, 0, oHead).scale.set(1.2, 0.94, 1);
  add(new T.SphereGeometry(0.4, 10, 8), C.cream, 0, 0.24, 0.42, oHead).scale.set(1.18, 0.55, 0.62);
  add(new T.SphereGeometry(0.06, 6, 4), C.pink, 0, 0.4, 0.66, oHead, true).scale.set(1.3, 0.8, 0.8);
  var oLids = [], ears = [];
  [-1, 1].forEach(function (s) {
    var e = group(s * 0.28, 0.55, 0.55, oHead);
    add(new T.SphereGeometry(0.1, 8, 6), C.eye, 0, 0, 0, e, true).scale.set(1.35, 0.5, 0.5);
    add(new T.SphereGeometry(0.035, 5, 4), C.black, s * -0.02, -0.005, 0.045, e, true);
    var lid = add(new T.BoxGeometry(0.3, 0.035, 0.05), C.black, 0, 0.035, 0.03, e, true);
    lid.rotation.z = s * -0.08;
    oLids.push(e);
    var ear = group(s * 0.45, 0.92, 0, oHead);
    ear.rotation.z = -s * 0.35;
    add(new T.ConeGeometry(0.21, 0.38, 4), C.orange, 0, 0, 0, ear);
    add(new T.ConeGeometry(0.12, 0.25, 4), C.pink, 0, -0.03, 0.08, ear, true);
    ears.push(ear);
    [0, 1].forEach(function (k) {
      var w = add(new T.BoxGeometry(0.4, 0.012, 0.012), C.black, s * 0.6, 0.27 + k * 0.07, 0.4, oHead, true);
      w.rotation.set(0, -s * 0.35, s * (0.12 - k * 0.2));
    });
  });

  /* ---------- Camera fit ---------- */
  function fit() {
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    var z = 13 * Math.pow(Math.max(1, 1.1 / camera.aspect), 0.85);
    camera.position.set(0, 3.3, z);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(host); else window.addEventListener('resize', fit);
  fit();

  /* ---------- Interaction ---------- */
  var pointer = { x: 0, y: 0, last: 0 };
  var drag = { on: false, x0: 0, y0: 0, moved: false, v: 0 };
  var spin = 0, spinTarget = 0;
  var ray = new T.Raycaster(), ndc = new T.Vector2();

  function setNdc(ev) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  }
  canvas.addEventListener('pointermove', function (ev) {
    setNdc(ev);
    pointer.x = ndc.x; pointer.y = ndc.y; pointer.last = performance.now();
    if (drag.on) {
      var dx = ev.clientX - drag.x0;
      if (Math.abs(dx) > 5) drag.moved = true;
      if (drag.moved) {
        spinTarget += (ev.clientX - drag.px) * 0.012;
        drag.v = (ev.clientX - drag.px) * 0.012;
      }
      drag.px = ev.clientX;
    }
  });
  canvas.addEventListener('pointerdown', function (ev) {
    drag.on = true; drag.moved = false; drag.x0 = drag.px = ev.clientX; drag.y0 = ev.clientY;
  });
  function end(ev) {
    if (!drag.on) return;
    drag.on = false;
    if (!drag.moved && ev.type === 'pointerup') { setNdc(ev); poke(); }
  }
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', function () { drag.on = false; });

  var LINES = {
    ucup: ['Oyen, pinjem kuota dong.', 'Ngoding dulu, gorengan kemudian!', 'Bentar, aku googling dulu.', 'Error 404: ngantuk tidak ditemukan.', 'Oyen, ada tamu tuh!'],
    oyen: ['Udah coba restart?', 'Meong. Artinya: baca FAQ dulu.', 'Jangan colek. Aku lagi mikir.', 'Hmm.', 'Ucup, itu bukan salah RAM.']
  };
  var idx = { ucup: 0, oyen: 0 };
  var act = { ucup: -10, oyen: -10 };
  var talk = { who: null, until: 0 };

  function say(who, text) {
    talk.who = who; talk.until = performance.now() + 2800;
    bubble.textContent = text;
    bubble.className = 'bubble3d show ' + who;
  }
  function poke() {
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects([ucup, oyen], true);
    if (!hits.length) return;
    var o = hits[0].object;
    while (o && !o.userData.who) o = o.parent;
    if (!o) return;
    var who = o.userData.who;
    act[who] = performance.now() / 1000;
    say(who, LINES[who][idx[who]++ % LINES[who].length]);
  }

  var tmp = new T.Vector3();
  function placeBubble() {
    if (!talk.who) return;
    if (performance.now() > talk.until) { bubble.className = 'bubble3d ' + talk.who; talk.who = null; return; }
    var head = talk.who === 'ucup' ? uHead : oHead;
    head.getWorldPosition(tmp);
    tmp.y += talk.who === 'ucup' ? 2.25 : 1.4;
    tmp.project(camera);
    var x = (tmp.x * 0.5 + 0.5) * host.clientWidth;
    var y = (-tmp.y * 0.5 + 0.5) * host.clientHeight;
    var half = bubble.offsetWidth / 2;
    x = Math.max(half + 6, Math.min(host.clientWidth - half - 6, x));
    bubble.style.transform = 'translate(' + (x - half) + 'px,' + Math.max(4, y - bubble.offsetHeight) + 'px)';
  }

  /* ---------- Animation ---------- */
  var running = true, t0 = performance.now(), nextBlink = 2, blinkAt = -1, nextTwitch = 3;
  function lerp(a, b, k) { return a + (b - a) * k; }

  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;

    if (!drag.on) { spinTarget += drag.v; drag.v *= 0.92; }
    spin = lerp(spin, spinTarget, 0.15);
    stage.rotation.y = spin + Math.sin(t * 0.35) * 0.08 * idle;

    var fresh = now - pointer.last < 2500;
    var lookU, lookO;
    if (fresh) {
      lookU = { y: pointer.x * 0.55, x: -pointer.y * 0.22 };
      lookO = { y: pointer.x * 0.5, x: -pointer.y * 0.18 };
    } else {
      var glance = Math.sin(t * 0.5) > 0.55;
      lookU = { y: glance ? 0.5 : 0.08 * Math.sin(t * 0.7), x: 0.04 };
      lookO = { y: glance ? -0.45 : -0.05, x: 0.06 * Math.sin(t * 0.4) };
    }
    uHead.rotation.y = lerp(uHead.rotation.y, lookU.y, 0.08);
    uHead.rotation.x = lerp(uHead.rotation.x, lookU.x, 0.08);
    oHead.rotation.y = lerp(oHead.rotation.y, lookO.y, 0.06);
    oHead.rotation.x = lerp(oHead.rotation.x, lookO.x, 0.06);
    oHead.rotation.z = Math.sin(t * 0.6) * 0.05 * idle;

    torso.scale.y = 1.05 + Math.sin(t * 2.2) * 0.018 * idle;
    belly.scale.y = 0.95 + Math.sin(t * 1.7) * 0.02 * idle;
    antenna.rotation.z = Math.sin(t * 1.8) * 0.12 * idle;
    tail.rotation.y = Math.sin(t * 1.6) * 0.28 * idle;

    if (t > nextBlink) { blinkAt = t; nextBlink = t + 2.5 + Math.random() * 3; }
    var b = blinkAt > 0 && t - blinkAt < 0.16 ? 0.12 : 1;
    uEyes.forEach(function (e) { e.scale.y = b; });
    oLids.forEach(function (e) { e.scale.y = b < 1 ? 0.3 : 1; });
    if (t > nextTwitch) { ears[Math.random() < 0.5 ? 0 : 1].userData.tw = t; nextTwitch = t + 3 + Math.random() * 4; }
    ears.forEach(function (ear, i) {
      var s = i === 0 ? -1 : 1, k = ear.userData.tw ? t - ear.userData.tw : 9;
      ear.rotation.z = -s * 0.35 + (k < 0.3 ? -s * 0.25 * Math.sin(k / 0.3 * Math.PI) : 0);
    });

    var ku = t - act.ucup;
    ucupBody.position.y = ku < 0.6 ? Math.sin(ku / 0.6 * Math.PI) * 0.55 : 0;
    arms[1].rotation.z = ku < 1.4 ? 2.4 + Math.sin(ku * 14) * 0.3 : lerp(arms[1].rotation.z, arms[1].userData.base, 0.12);
    var ko = t - act.oyen;
    var sq = ko < 0.5 ? Math.sin(ko / 0.5 * Math.PI) : 0;
    oyenBody.scale.set(1 + sq * 0.08, 1 - sq * 0.12, 1 + sq * 0.08);
    if (ko < 1.2) tail.rotation.y = Math.sin(ko * 18) * 0.6;

    renderer.render(scene, camera);
    placeBubble();
    requestAnimationFrame(frame);
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(frame); }
      else if (!vis) running = false;
    }).observe(host);
  }
  requestAnimationFrame(frame);
  host.classList.add('ready');
  setTimeout(function () { say('ucup', 'Oyen, ada tamu tuh!'); }, 900);
  setTimeout(function () { say('oyen', 'Hmm. Sapa dulu, Cup.'); }, 3900);
})();
