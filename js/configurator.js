/**
 * INTENYTE NT-01 Smart Home Dashboard Configurator
 * Allows users to customize theme, accent color, and feature toggles
 * for the NT-01 dashboard preview.
 */
function Configurator() {
  this.config = this.loadConfig();
  this.init();
}

Configurator.prototype = {
  /**
   * Default configuration values
   */
  defaults: {
    theme: 'dark',
    accentColor: '#00BFA5',
    features: {
      weather: true,
      clock: true,
      notes: false
    }
  },

  /**
   * Available theme definitions with colors
   */
  themes: {
    dark: { bg: '#1a1a2e', text: '#e0e0e0', card: '#16213e', label: 'Dark Mode' },
    light: { bg: '#f5f5f5', text: '#333333', card: '#ffffff', label: 'Light Mode' },
    neon: { bg: '#0d0d0d', text: '#00ff88', card: '#1a1a1a', label: 'Neon Mode' },
    ocean: { bg: '#0a192f', text: '#ccd6f6', card: '#112240', label: 'Ocean Mode' }
  },

  /**
   * Initialize event listeners and apply saved config
   */
  init: function() {
    this.bindThemeOptions();
    this.bindColorSwatches();
    this.bindFeatureToggles();
    this.applyConfig();
  },

  /**
   * Bind click events to theme option elements
   */
  bindThemeOptions: function() {
    var self = this;
    var options = document.querySelectorAll('.theme-option');
    for (var i = 0; i < options.length; i++) {
      options[i].addEventListener('click', function() {
        var theme = this.getAttribute('data-theme');
        if (theme && self.themes[theme]) {
          self.config.theme = theme;
          self.saveConfig();
          self.applyConfig();
          self.dispatchChange();
        }
      });
    }
  },

  /**
   * Bind click events to color swatch elements
   */
  bindColorSwatches: function() {
    var self = this;
    var swatches = document.querySelectorAll('.color-swatch');
    for (var i = 0; i < swatches.length; i++) {
      swatches[i].addEventListener('click', function() {
        var color = this.getAttribute('data-color');
        if (color) {
          self.config.accentColor = color;
          self.saveConfig();
          self.applyConfig();
          self.dispatchChange();
        }
      });
    }
  },

  /**
   * Bind click events to feature toggle switches
   */
  bindFeatureToggles: function() {
    var self = this;
    var toggles = document.querySelectorAll('.toggle-switch');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function() {
        var feature = this.getAttribute('data-feature');
        if (feature && self.config.features.hasOwnProperty(feature)) {
          self.config.features[feature] = !self.config.features[feature];
          this.classList.toggle('active', self.config.features[feature]);
          self.saveConfig();
          self.applyConfig();
          self.dispatchChange();
        }
      });
    }
  },

  /**
   * Apply current configuration to the device preview (both screens)
   */
  applyConfig: function() {
    var theme = this.themes[this.config.theme] || this.themes.dark;
    var label = document.querySelector('.config-preview-label');
    var left = document.querySelector('.config-screen-left');
    var right = document.querySelector('.config-screen-right');
    var accent = this.config.accentColor;

    /* set accent CSS variable on the preview */
    var preview = document.querySelector('.config-preview');
    if (preview) preview.style.setProperty('--cfg-accent', accent);

    if (left) {
      left.style.background = 'linear-gradient(160deg,' + theme.bg + ',' + theme.card + ')';
      left.style.borderColor = accent;
      left.style.boxShadow = 'inset 0 0 0 1px ' + accent + ', 0 0 18px ' + accent + '44';
    }
    if (right) {
      right.style.background = 'linear-gradient(160deg,' + theme.bg + ',' + theme.card + ')';
      right.style.borderColor = accent;
      right.style.boxShadow = 'inset 0 0 0 1px ' + accent + ', 0 0 18px ' + accent + '44';
    }

    /* recolor inner cards to theme.card */
    var cards = document.querySelectorAll('.config-preview .cfg-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.background = theme.card;
    }

    if (label) {
      var themeName = this.config.theme === 'dark' ? 'Midnight Black' :
                      this.config.theme === 'light' ? 'Arctic White' :
                      this.config.theme === 'neon' ? 'Neon Glow' : 'Ocean Deep';
      var colorNames = {
        '#00BFA5': 'Teal', '#2979FF': 'Blue', '#7C4DFF': 'Purple',
        '#FF6D00': 'Orange', '#FF4081': 'Pink', '#00E5FF': 'Cyan'
      };
      var colorName = colorNames[accent] || accent;
      label.textContent = themeName + ' \u2022 ' + colorName;
    }

    this.updateToggleStates();
  },

  /**
   * Sync toggle switch visual states with config
   */
  updateToggleStates: function() {
    var toggles = document.querySelectorAll('.toggle-switch');
    for (var i = 0; i < toggles.length; i++) {
      var feature = toggles[i].getAttribute('data-feature');
      if (feature && this.config.features.hasOwnProperty(feature)) {
        if (this.config.features[feature]) {
          toggles[i].classList.add('active');
        } else {
          toggles[i].classList.remove('active');
        }
      }
    }
  },

  /**
   * Save configuration to localStorage
   */
  saveConfig: function() {
    try {
      localStorage.setItem('nt01_config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save config to localStorage:', e);
    }
  },

  /**
   * Load configuration from localStorage or return defaults
   */
  loadConfig: function() {
    try {
      var saved = localStorage.getItem('nt01_config');
      if (saved) {
        var parsed = JSON.parse(saved);
        return {
          theme: parsed.theme || this.defaults.theme,
          accentColor: parsed.accentColor || this.defaults.accentColor,
          features: {
            weather: parsed.features ? parsed.features.weather : this.defaults.features.weather,
            clock: parsed.features ? parsed.features.clock : this.defaults.features.clock,
            notes: parsed.features ? parsed.features.notes : this.defaults.features.notes
          }
        };
      }
    } catch (e) {
      console.warn('Could not load config from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(this.defaults));
  },

  /**
   * Dispatch custom configChange event with current config
   */
  dispatchChange: function() {
    var event = new CustomEvent('configChange', {
      detail: {
        theme: this.config.theme,
        accentColor: this.config.accentColor,
        features: JSON.parse(JSON.stringify(this.config.features))
      }
    });
    document.dispatchEvent(event);
  },

  /**
   * Get current configuration object
   * @returns {Object} Current config with theme, accentColor, and features
   */
  getConfig: function() {
    return {
      theme: this.config.theme,
      accentColor: this.config.accentColor,
      features: JSON.parse(JSON.stringify(this.config.features))
    };
  }
};

/* Auto-instantiate when DOM is ready */
var configurator;
document.addEventListener('DOMContentLoaded', function() {
  configurator = new Configurator();
});
