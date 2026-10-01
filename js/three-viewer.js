/**
 * ThreeViewer - 3D Product Viewer for INTENYTE NT-01
 * Accurate model: wide horizontal panel, black rounded frame,
 * tan/cork face, two embedded screens (dashboard + fan control).
 */
var ThreeViewer = (function () {
  var DEFAULTS = {
    bgColor: 0x121418,
    cameraDistance: 5.2,
    autoRotateSpeed: 0.004,
    zoomStep: 0.3,
    zoomMin: 2.5,
    zoomMax: 9
  };

  function ThreeViewer(containerId, options) {
    this.containerId = containerId;
    this.opts = merge({}, DEFAULTS, options || {});
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.device = null;
    this.particles = null;
    this.leftScreenMesh = null;
    this.rightScreenMesh = null;
    this.autoRotate = true;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.rotationTarget = { x: 0.1, y: -0.35 };
    this.rotationCurrent = { x: 0.1, y: -0.35 };
    this.zoomTarget = this.opts.cameraDistance;
    this.zoomCurrent = this.opts.cameraDistance;
    this._disposed = false;
    this._rafId = null;
    this._boundOnResize = null;
    this._boundOnMouseDown = null;
    this._boundOnMouseMove = null;
    this._boundOnMouseUp = null;
    this._boundOnWheel = null;
    this._screens = { left: { lights: [true, false, true] }, right: { fanOn: true, speed: 72 } };
    this.init();
  }

  function merge(dest) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (src) { for (var k in src) { if (src.hasOwnProperty(k)) dest[k] = src[k]; } }
    }
    return dest;
  }

  /* Creates a rounded rectangle shape path */
  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  /* Extruded rounded box */
  function roundedBox(w, h, d, r, mat) {
    var shape = roundedRectShape(w, h, r);
    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: d, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 8
    });
    geo.translate(0, 0, -d / 2);
    return new THREE.Mesh(geo, mat);
  }

  ThreeViewer.prototype.init = function () {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.opts.bgColor);

    this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, this.opts.cameraDistance);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this._buildLights();
    this._buildDevice();
    this._buildParticles();
    this._buildControls();
    this._animate();
  };

  ThreeViewer.prototype._buildLights = function () {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xfff5e6, 0x404050, 0.4));

    var key = new THREE.PointLight(0xfff0dd, 1.1, 20);
    key.position.set(3, 3, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    this.scene.add(key);

    var fill = new THREE.PointLight(0xd0e8ff, 0.5, 15);
    fill.position.set(-3, 1, 3);
    this.scene.add(fill);

    var rim = new THREE.PointLight(0x88aaff, 0.4, 12);
    rim.position.set(0, -2, -3);
    this.scene.add(rim);
  };

  /*
   * Device structure (matching the real NT-01):
   *  - Outer black rounded frame  (wide, ~3.4 : 1.3 ratio)
   *  - Tan/cork face plate inset on front
   *  - Left screen: bigger, positioned left (dashboard UI)
   *  - Right screen: smaller, positioned right (fan UI)
   *  - Screws on the bottom edge
   */
  ThreeViewer.prototype._buildDevice = function () {
    this.device = new THREE.Group();

    var FW = 3.4, FH = 1.3, FD = 0.18, FR = 0.14;

    /* ---- Black outer frame ---- */
    var frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.55, metalness: 0.25 });
    var frame = roundedBox(FW, FH, FD, FR, frameMat);
    frame.castShadow = true;
    frame.receiveShadow = true;
    this.device.add(frame);

    /* ---- Tan / cork face plate ---- */
    var faceW = FW - 0.14, faceH = FH - 0.14;
    var faceMat = new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.85, metalness: 0.02 });
    var face = roundedBox(faceW, faceH, 0.05, 0.1, faceMat);
    face.position.z = FD / 2 - 0.01;
    face.receiveShadow = true;
    this.device.add(face);

    /* subtle wood-grain-ish top layer via second face */
    var faceGrainMat = new THREE.MeshStandardMaterial({ color: 0xd4b67a, roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.35 });
    var grain = roundedBox(faceW - 0.04, faceH - 0.04, 0.02, 0.09, faceGrainMat);
    grain.position.z = FD / 2 + 0.02;
    this.device.add(grain);

    /* ---- Screen bezels + screens ---- */
    /* Left screen (dashboard) — bigger */
    var lBezelW = 1.35, lBezelH = 0.88;
    var lBezelX = -0.72;
    this._buildScreenAssembly(lBezelW, lBezelH, lBezelX, 'left');

    /* Right screen (fan) — smaller */
    var rBezelW = 1.1, rBezelH = 0.78;
    var rBezelX = 0.85;
    this._buildScreenAssembly(rBezelW, rBezelH, rBezelX, 'right');

    /* ---- Screws on bottom edge ---- */
    var screwGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
    var screwMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.6 });
    var screwPositions = [-0.9, 0, 0.9];
    for (var i = 0; i < screwPositions.length; i++) {
      var screw = new THREE.Mesh(screwGeo, screwMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(screwPositions[i], -FH / 2 - 0.005, 0);
      this.device.add(screw);
      /* screw slot */
      var slotGeo = new THREE.BoxGeometry(0.04, 0.008, 0.015);
      var slotMat = new THREE.MeshBasicMaterial({ color: 0x111 });
      var slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(screwPositions[i], -FH / 2 - 0.015, 0.01);
      this.device.add(slot);
    }

    this.device.rotation.x = this.rotationTarget.x;
    this.device.rotation.y = this.rotationTarget.y;
    this.scene.add(this.device);

    /* wall behind */
    var wallGeo = new THREE.PlaneGeometry(14, 8);
    var wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.95 });
    var wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.z = -0.5;
    wall.receiveShadow = true;
    this.scene.add(wall);
  };

  /* Build a black bezel + emissive screen for each display */
  ThreeViewer.prototype._buildScreenAssembly = function (w, h, x, side) {
    var zFace = 0.105; /* front of the face plate */

    /* bezel */
    var bezelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.3, metalness: 0.4 });
    var bezel = roundedBox(w, h, 0.04, 0.04, bezelMat);
    bezel.position.set(x, 0.02, zFace);
    this.device.add(bezel);

    /* screen surface */
    var screenMat = new THREE.MeshStandardMaterial({
      color: 0x000000, roughness: 0.15, metalness: 0.0,
      emissive: 0xffffff, emissiveIntensity: 0.0
    });
    var screenGeo = new THREE.PlaneGeometry(w - 0.07, h - 0.07);
    var screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(x, 0.02, zFace + 0.025);
    this.device.add(screen);

    /* canvas texture */
    var canvas = document.createElement('canvas');
    if (side === 'left') { canvas.width = 640; canvas.height = 420; }
    else { canvas.width = 560; canvas.height = 400; }
    var ctx = canvas.getContext('2d');
    if (side === 'left') this._drawDashboardUI(ctx, canvas.width, canvas.height);
    else this._drawFanUI(ctx, canvas.width, canvas.height);

    var tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    screenMat.map = tex;
    screenMat.emissiveMap = tex;
    screenMat.emissive.set(0xffffff);
    screenMat.emissiveIntensity = 0.85;
    screenMat.needsUpdate = true;

    if (side === 'left') { this.leftScreenMesh = screen; this._leftCanvas = canvas; this._leftTex = tex; }
    else { this.rightScreenMesh = screen; this._rightCanvas = canvas; this._rightTex = tex; }
  };

  /* ---------- LEFT SCREEN : Dashboard UI ---------- */
  ThreeViewer.prototype._drawDashboardUI = function (ctx, W, H) {
    var self = this;
    var lights = this._screens.left.lights;
    var now = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var day = days[now.getDay()];
    var dateStr = now.getDate() + ' ' + months[now.getMonth()];
    var h = now.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    var timeStr = (h < 10 ? '0' : '') + h + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ' ' + ap;

    /* theme = purple/violet (matching Hero_image) */
    var bg = '#2a1a80';
    var card = '#3d2bbf';
    var cardLight = '#4a35d4';
    var accent = '#ff5cc8';
    var white = '#ffffff';

    /* bg */
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* --- top row: time card + weather card --- */
    var pad = 16, gap = 10;
    var topY = pad;
    var topH = H * 0.44;
    var timeW = W * 0.60;
    var wxW = W * 0.60;
    var rightW = W - pad - timeW - gap - pad;

    /* time card */
    ctx.fillStyle = card;
    roundRect(ctx, pad, topY, timeW, topH, 12);
    ctx.fill();
    ctx.fillStyle = white;
    ctx.font = '600 15px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(day, pad + timeW / 2, topY + 24);
    ctx.font = '700 38px Inter, Arial';
    ctx.fillText(timeStr, pad + timeW / 2, topY + 66);
    ctx.font = '500 13px Inter, Arial';
    ctx.globalAlpha = 0.75;
    ctx.fillText(dateStr, pad + timeW / 2, topY + 92);
    ctx.globalAlpha = 1;

    /* weather card */
    var wxX = pad + timeW + gap;
    ctx.fillStyle = card;
    roundRect(ctx, wxX, topY, rightW, topH, 12);
    ctx.fill();
    ctx.fillStyle = white;
    ctx.textAlign = 'left';
    ctx.font = '600 9px Inter, Arial';
    ctx.globalAlpha = 0.6;
    ctx.fillText('WEATHER', wxX + 10, topY + 16);
    ctx.globalAlpha = 1;
    ctx.font = '700 26px Inter, Arial';
    ctx.fillText('28°', wxX + 10, topY + 48);
    ctx.font = '500 11px Inter, Arial';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Cloudy', wxX + 10, topY + 66);
    ctx.font = '500 9px Inter, Arial';
    ctx.globalAlpha = 0.55;
    ctx.fillText('64%  ·  18 km/h', wxX + 10, topY + 84);
    ctx.globalAlpha = 1;
    /* sun icon */
    ctx.font = '24px Arial';
    ctx.fillText('☀', wxX + rightW - 34, topY + 40);

    /* --- bottom row : 3 light toggles --- */
    var botY = topY + topH + gap;
    var botH = H - botY - pad;
    var lw = (W - pad * 2 - gap * 2) / 3;
    var labels = ['LIGHT 1', 'LIGHT 2', 'LIGHT 3'];

    for (var i = 0; i < 3; i++) {
      var lx = pad + i * (lw + gap);
      /* card */
      ctx.fillStyle = lights[i] ? cardLight : card;
      roundRect(ctx, lx, botY, lw, botH, 12);
      ctx.fill();

      /* label */
      ctx.fillStyle = white;
      ctx.textAlign = 'left';
      ctx.font = '700 11px Inter, Arial';
      ctx.fillText(labels[i], lx + 10, botY + 18);

      /* status dot */
      ctx.fillStyle = lights[i] ? '#4caf50' : '#ff9800';
      ctx.beginPath();
      ctx.arc(lx + lw - 14, botY + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      /* toggle track */
      var tgW = lw - 20, tgH = 26, tgX = lx + 10, tgY = botY + botH - tgH - 12;
      var r = tgH / 2;
      ctx.fillStyle = lights[i] ? accent : 'rgba(255,255,255,.22)';
      roundRect(ctx, tgX, tgY, tgW, tgH, r);
      ctx.fill();

      /* toggle knob */
      var knobR = tgH / 2 - 3;
      var knobX = lights[i] ? tgX + tgW - knobR - 3 : tgX + knobR + 3;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(knobX, tgY + tgH / 2, knobR, 0, Math.PI * 2);
      ctx.fill();

      /* ON / OFF label */
      ctx.fillStyle = white;
      ctx.textAlign = 'center';
      ctx.font = '700 9px Inter, Arial';
      ctx.globalAlpha = 0.85;
      ctx.fillText(lights[i] ? 'ON' : 'OFF', lx + lw / 2, tgY + tgH + 12);
      ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'left';
    if (this._leftTex) this._leftTex.needsUpdate = true;
  };

  /* ---------- RIGHT SCREEN : Fan control UI ---------- */
  ThreeViewer.prototype._drawFanUI = function (ctx, W, H) {
    var fan = this._screens.right;
    var bg = '#2a1a80';
    var card = '#3d2bbf';
    var accent = '#ff5cc8';
    var white = '#ffffff';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 16;

    /* header */
    ctx.fillStyle = white;
    ctx.font = '700 18px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('FAN', pad, pad + 20);

    /* ONLINE pill */
    var pillW = 74, pillH = 24;
    var pillX = W - pad - pillW;
    ctx.fillStyle = card;
    roundRect(ctx, pillX, pad, pillW, pillH, 12);
    ctx.fill();
    ctx.fillStyle = '#4caf50';
    ctx.font = '600 10px Inter, Arial';
    ctx.fillText('📶 ONLINE', pillX + 8, pad + 16);

    /* gear */
    ctx.fillStyle = white;
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('⚙', W - pad, pad + 44);

    /* --- circular dial --- */
    var cx = W * 0.40, cy = H * 0.55, R = Math.min(W, H) * 0.30;
    var start = Math.PI * 0.75, end = Math.PI * 2.25;
    var pct = fan.speed / 100;

    /* track */
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, R, start, end);
    ctx.stroke();

    /* value arc (pink gradient feel) */
    ctx.strokeStyle = accent;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, R, start, start + (end - start) * pct);
    ctx.stroke();

    /* glow */
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, R, start, start + (end - start) * pct);
    ctx.stroke();
    ctx.restore();

    /* fan blades in center */
    var bladeR = R * 0.42;
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath();
    ctx.arc(cx, cy, bladeR, 0, Math.PI * 2);
    ctx.fill();
    /* blades */
    ctx.fillStyle = accent;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(fan.fanOn ? Date.now() * 0.003 * (fan.speed / 50 + 0.3) : 0);
    for (var b = 0; b < 3; b++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, -bladeR * 0.5, bladeR * 0.24, bladeR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    /* hub */
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, bladeR * 0.16, 0, Math.PI * 2);
    ctx.fill();

    /* FAST MEDIUM LOW labels */
    ctx.fillStyle = white;
    ctx.font = '700 10px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.85;
    ctx.fillText('FAST   MEDIUM   LOW', cx, cy + R + 32);
    ctx.globalAlpha = 1;

    /* speed badge */
    ctx.fillStyle = accent;
    roundRect(ctx, cx - 55, cy + R + 42, 110, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 11px Inter, Arial';
    ctx.fillText('FAN SPEED  ' + fan.speed + '%', cx, cy + R + 58);

    /* --- FAN POWER toggle (right side) --- */
    var tW = 58, tH = 130;
    var tX = W - pad - tW - 6, tY = H * 0.30;
    ctx.fillStyle = white;
    ctx.font = '700 10px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FAN POWER', tX + tW / 2, tY - 8);

    ctx.fillStyle = card;
    roundRect(ctx, tX, tY, tW, tH, 16);
    ctx.fill();

    /* vertical toggle */
    var tgX = tX + tW / 2 - 13, tgY = tY + 14, tgW = 26, tgH = tH - 46;
    ctx.fillStyle = fan.fanOn ? accent : 'rgba(255,255,255,.2)';
    roundRect(ctx, tgX, tgY, tgW, tgH, 13);
    ctx.fill();

    /* knob */
    var knobY = fan.fanOn ? tgY + tgH - 15 : tgY + 15;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(tgX + 13, knobY, 10, 0, Math.PI * 2);
    ctx.fill();

    /* ON / OFF */
    ctx.fillStyle = white;
    ctx.font = '700 10px Inter, Arial';
    ctx.fillText(fan.fanOn ? 'ON' : 'OFF', tX + tW / 2, tY + tH - 12);

    ctx.textAlign = 'left';
    if (this._rightTex) this._rightTex.needsUpdate = true;
  };

  /* Utility: rounded rect path on canvas */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  ThreeViewer.prototype._buildParticles = function () {
    var count = 60;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: 0xffccaa, size: 0.018, transparent: true, opacity: 0.25,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  };

  ThreeViewer.prototype._buildControls = function () {
    var self = this;
    this._boundOnMouseDown = function (e) {
      if (e.target !== self.renderer.domElement) return;
      self.isDragging = true;
      self.prevMouse.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      self.prevMouse.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };
    this._boundOnMouseMove = function (e) {
      if (!self.isDragging) return;
      var x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      self.rotationTarget.y += (x - self.prevMouse.x) * 0.008;
      self.rotationTarget.x += (y - self.prevMouse.y) * 0.008;
      self.rotationTarget.x = Math.max(-0.8, Math.min(0.8, self.rotationTarget.x));
      self.prevMouse.x = x;
      self.prevMouse.y = y;
    };
    this._boundOnMouseUp = function () { self.isDragging = false; };
    this._boundOnWheel = function (e) {
      e.preventDefault();
      self.zoomTarget += e.deltaY > 0 ? self.opts.zoomStep : -self.opts.zoomStep;
      self.zoomTarget = Math.max(self.opts.zoomMin, Math.min(self.opts.zoomMax, self.zoomTarget));
    };

    var el = this.renderer.domElement;
    el.addEventListener('mousedown', this._boundOnMouseDown);
    el.addEventListener('mousemove', this._boundOnMouseMove);
    el.addEventListener('mouseup', this._boundOnMouseUp);
    el.addEventListener('mouseleave', this._boundOnMouseUp);
    el.addEventListener('wheel', this._boundOnWheel, { passive: false });
    el.addEventListener('touchstart', this._boundOnMouseDown, { passive: true });
    el.addEventListener('touchmove', function (e) { if (self.isDragging && e.touches.length === 1) self._boundOnMouseMove(e); }, { passive: true });
    el.addEventListener('touchend', this._boundOnMouseUp);

    this._boundOnResize = function () { self._onResize(); };
    window.addEventListener('resize', this._boundOnResize);

    /* control buttons */
    var btnRotate = document.getElementById('viewerAutoRotate');
    var btnReset = document.getElementById('viewerReset');
    var btnIn = document.getElementById('viewerZoomIn');
    var btnOut = document.getElementById('viewerZoomOut');
    if (btnRotate) btnRotate.addEventListener('click', function () { self.autoRotate = !self.autoRotate; });
    if (btnReset) btnReset.addEventListener('click', function () { self.resetView(); });
    if (btnIn) btnIn.addEventListener('click', function () { self.zoomIn(); });
    if (btnOut) btnOut.addEventListener('click', function () { self.zoomOut(); });
  };

  ThreeViewer.prototype._onResize = function () {
    if (this._disposed || !this.container) return;
    var w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  ThreeViewer.prototype._animate = function () {
    var self = this;
    if (this._disposed) return;
    this._rafId = requestAnimationFrame(function () { self._animate(); });

    if (this.autoRotate && !this.isDragging) this.rotationTarget.y += this.opts.autoRotateSpeed;

    this.rotationCurrent.x += (this.rotationTarget.x - this.rotationCurrent.x) * 0.08;
    this.rotationCurrent.y += (this.rotationTarget.y - this.rotationCurrent.y) * 0.08;
    this.zoomCurrent += (this.zoomTarget - this.zoomCurrent) * 0.08;

    if (this.device) {
      this.device.rotation.x = this.rotationCurrent.x;
      this.device.rotation.y = this.rotationCurrent.y;
    }
    this.camera.position.z = this.zoomCurrent;

    if (this.particles) this.particles.rotation.y += 0.0004;

    /* redraw fan screen every ~200ms so blades animate */
    if (!this._fanTimer) this._fanTimer = 0;
    this._fanTimer++;
    if (this._fanTimer % 12 === 0 && this.rightScreenMesh && this._rightCanvas) {
      this._drawFanUI(this._rightCanvas.getContext('2d'), this._rightCanvas.width, this._rightCanvas.height);
    }

    this.renderer.render(this.scene, this.camera);
  };

  ThreeViewer.prototype.setAutoRotate = function (v) { this.autoRotate = !!v; };
  ThreeViewer.prototype.resetView = function () {
    this.rotationTarget.x = 0.1;
    this.rotationTarget.y = -0.35;
    this.zoomTarget = this.opts.cameraDistance;
  };
  ThreeViewer.prototype.zoomIn = function () { this.zoomTarget = Math.max(this.opts.zoomMin, this.zoomTarget - this.opts.zoomStep); };
  ThreeViewer.prototype.zoomOut = function () { this.zoomTarget = Math.min(this.opts.zoomMax, this.zoomTarget + this.opts.zoomStep); };

  ThreeViewer.prototype.dispose = function () {
    if (this._disposed) return;
    this._disposed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    var el = this.renderer ? this.renderer.domElement : null;
    if (el) {
      el.removeEventListener('mousedown', this._boundOnMouseDown);
      el.removeEventListener('mousemove', this._boundOnMouseMove);
      el.removeEventListener('mouseup', this._boundOnMouseUp);
      el.removeEventListener('mouseleave', this._boundOnMouseUp);
      el.removeEventListener('wheel', this._boundOnWheel);
      el.removeEventListener('touchstart', this._boundOnMouseDown);
      el.removeEventListener('touchend', this._boundOnMouseUp);
    }
    if (this._boundOnResize) window.removeEventListener('resize', this._boundOnResize);
    if (this.scene) {
      this.scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { Array.isArray(o.material) ? o.material.forEach(function (m) { m.dispose(); }) : o.material.dispose(); }
      });
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement.parentNode === this.container) this.container.removeChild(this.renderer.domElement);
    }
    this.scene = null; this.camera = null; this.renderer = null; this.device = null;
  };

  return ThreeViewer;
})();

document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('three-viewer');
  if (el && typeof THREE !== 'undefined') {
    window.ntViewer = new ThreeViewer('three-viewer');
  }
});
