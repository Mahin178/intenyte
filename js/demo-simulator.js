/**
 * DemoSimulator - Interactive NT-01 device simulation
 * Matches the real NT-01 dual-screen dashboard:
 *  - Left screen: time/weather + 3 light toggles
 *  - Right screen: fan dial + fan power + speed slider
 *  - Theme switcher: purple / blue / green / red
 */
function DemoSimulator() {
  this.state = {
    lights: [true, false, true],
    fanOn: true,
    fanSpeed: 72,
    theme: 'purple'
  };
  this._clockTimer = null;
  this.init();
}

DemoSimulator.prototype.init = function () {
  this.bindThemeChips();
  this.bindLightToggles();
  this.bindFanPower();
  this.bindFanSlider();
  this.updateClock();
  this.updateFanDial();
  this.startClock();

  var self = this;
  document.addEventListener('configChange', function (e) {
    /* keep demo in sync if user changes configurator accent (optional) */
  });
};

/* ---------- Theme chips ---------- */
DemoSimulator.prototype.bindThemeChips = function () {
  var self = this;
  var chips = document.querySelectorAll('.demo-theme-chip');
  var sim = document.getElementById('deviceSim');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function () {
      var theme = this.getAttribute('data-theme');
      if (!theme || !sim) return;
      sim.setAttribute('data-theme', theme);
      self.state.theme = theme;
      for (var j = 0; j < chips.length; j++) chips[j].classList.remove('active');
      this.classList.add('active');
    });
  }
};

/* ---------- Light toggles ---------- */
DemoSimulator.prototype.bindLightToggles = function () {
  var self = this;
  var cards = document.querySelectorAll('.light-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-light'), 10) - 1;
      if (isNaN(idx)) return;
      self.state.lights[idx] = !self.state.lights[idx];
      this.classList.toggle('on', self.state.lights[idx]);
      var stateEl = this.querySelector('.light-state');
      if (stateEl) stateEl.textContent = self.state.lights[idx] ? 'ON' : 'OFF';
    });
  }
};

/* ---------- Fan power toggle ---------- */
DemoSimulator.prototype.bindFanPower = function () {
  var self = this;
  var toggle = document.getElementById('fanPowerToggle');
  if (!toggle) return;
  toggle.addEventListener('click', function () {
    self.state.fanOn = !self.state.fanOn;
    toggle.classList.toggle('on', self.state.fanOn);
    var stateEl = toggle.parentNode.querySelector('.fan-power-state');
    if (stateEl) stateEl.textContent = self.state.fanOn ? 'ON' : 'OFF';
    self.updateFanSpinning();
    self.updateFanDial();
  });
};

/* ---------- Fan speed slider ---------- */
DemoSimulator.prototype.bindFanSlider = function () {
  var self = this;
  var slider = document.getElementById('fanSlider');
  if (!slider) return;
  slider.addEventListener('input', function () {
    self.state.fanSpeed = parseInt(this.value, 10) || 0;
    var pctEl = document.getElementById('fanSpeedPct');
    if (pctEl) pctEl.textContent = self.state.fanSpeed + '%';
    self.updateFanDial();
  });
};

/* ---------- SVG dial arc ---------- */
DemoSimulator.prototype.updateFanDial = function () {
  var dial = document.querySelector('.dial-value');
  if (!dial) return;
  /* circumference = 2 * PI * 80 ≈ 503; dasharray tracks 377 (270deg) */
  var trackLen = 377;
  var visible = this.state.fanOn ? (trackLen * this.state.fanSpeed) / 100 : 0;
  dial.setAttribute('stroke-dasharray', visible + ' 503');
};

/* ---------- Fan blades spinning ---------- */
DemoSimulator.prototype.updateFanSpinning = function () {
  var blades = document.getElementById('fanBlades');
  if (!blades) return;
  if (this.state.fanOn && this.state.fanSpeed > 0) {
    blades.classList.add('spinning');
    var dur = 1.6 - (this.state.fanSpeed / 100) * 1.3;
    blades.style.animationDuration = Math.max(0.25, dur) + 's';
  } else {
    blades.classList.remove('spinning');
  }
};

/* ---------- Clock ---------- */
DemoSimulator.prototype.startClock = function () {
  var self = this;
  this.updateClock();
  this._clockTimer = setInterval(function () { self.updateClock(); }, 1000);
  /* also re-sync spinning speed when slider changes */
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'fanSlider') self.updateFanSpinning();
  });
  /* initial spin state */
  this.updateFanSpinning();
};

DemoSimulator.prototype.updateClock = function () {
  var now = new Date();
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var h = now.getHours();
  var ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  var m = now.getMinutes();
  var timeStr = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;

  var dayEl = document.getElementById('demoDay');
  var timeEl = document.getElementById('demoTime');
  var dateEl = document.getElementById('demoDate');

  if (dayEl) dayEl.textContent = days[now.getDay()];
  if (timeEl) timeEl.textContent = timeStr;
  if (dateEl) dateEl.textContent = now.getDate() + ' ' + months[now.getMonth()];
};

/* ---------- State getter / cleanup ---------- */
DemoSimulator.prototype.getState = function () {
  return JSON.parse(JSON.stringify(this.state));
};

DemoSimulator.prototype.destroy = function () {
  if (this._clockTimer) clearInterval(this._clockTimer);
  this._clockTimer = null;
};

/* auto-init */
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('deviceSim')) {
    window.demoSim = new DemoSimulator();
  }
});
