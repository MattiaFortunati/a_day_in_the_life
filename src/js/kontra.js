/*
 * Kontra.js v3.0.0 (Custom Build on 2017-08-23) | MIT
 * Build: https://straker.github.io/kontra/download?files=gameLoop+assets
 */
this.kontra = {

  /**
   * Initialize the canvas.
   * @memberof kontra
   *
   * @param {string|HTMLCanvasElement} canvas - Main canvas ID or Element for the game.
   */
  init: function init(canvas) {

    // check if canvas is a string first, an element next, or default to getting
    // first canvas on page
    var canvasEl = this.canvas = document.getElementById(canvas) ||
                                 canvas ||
                                 document.querySelector('canvas');

    if (!this._isCanvas(canvasEl)) {
      throw Error('You must provide a canvas element for the game');
    }

    this.context = canvasEl.getContext('2d');
  },

  /**
   * Noop function.
   * @see https://stackoverflow.com/questions/21634886/what-is-the-javascript-convention-for-no-operation#comment61796464_33458430
   * @memberof kontra
   * @private
   *
   * The new operator is required when using sinon.stub to replace with the noop.
   */
  _noop: new Function,

  /*
   * Determine if a value is a String.
   * @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isString: function isString(value) {
    return ''+value === value;
  },

  /**
   * Determine if a value is a Number.
   * @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isNumber: function isNumber(value) {
    return +value === value;
  },

  /**
   * Determine if a value is a Function.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isFunc: function isFunction(value) {
    return typeof value === 'function';
  },

  /**
   * Determine if a value is an Image. An image can also be a canvas element for
   * the purposes of drawing using drawImage().
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isImage: function isImage(value) {
    return !!value && value.nodeName === 'IMG' || this._isCanvas(value);
  },

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   * @private
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  _isCanvas: function isCanvas(value) {
    return !!value && value.nodeName === 'CANVAS';
  }
};

(function(kontra, requestAnimationFrame, performance) {

  /**
   * Game loop that updates and renders the game every frame.
   * @memberof kontra
   *
   * @param {object}   properties - Properties of the game loop.
   * @param {number}   [properties.fps=60] - Desired frame rate.
   * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
   * @param {function} properties.update - Function called to update the game.
   * @param {function} properties.render - Function called to render the game.
   */
  kontra.gameLoop = function(properties) {
    properties = properties || {};

    // check for required functions
    if ( !(kontra._isFunc(properties.update) && kontra._isFunc(properties.render)) ) {
      throw Error('You must provide update() and render() functions');
    }

    // animation variables
    var fps = properties.fps || 60;
    var accumulator = 0;
    var delta = 1E3 / fps;  // delta between performance.now timings (in ms)
    var step = 1 / fps;

    var clear = (properties.clearCanvas === false ?
                kontra._noop :
                function clear() {
                  kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
                });
    var last, rAF, now, dt;

    /**
     * Called every frame of the game loop.
     */
    function frame() {
      rAF = requestAnimationFrame(frame);

      now = performance.now();
      dt = now - last;
      last = now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (dt > 1E3) {
        return;
      }

      accumulator += dt;

      while (accumulator >= delta) {
        gameLoop.update(step);

        accumulator -= delta;
      }

      clear();
      gameLoop.render();
    }

    // game loop object
    var gameLoop = {
      update: properties.update,
      render: properties.render,
      isStopped: true,

      /**
       * Start the game loop.
       * @memberof kontra.gameLoop
       */
      start: function start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },

      /**
       * Stop the game loop.
       */
      stop: function stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },

      // expose properties for testing
      _frame: frame,
      set _last(value) {
        last = value;
      }
    };

    return gameLoop;
  };
})(kontra, requestAnimationFrame, performance);

(function(Promise) {
  var imageRegex = /(jpeg|jpg|gif|png)$/;
  var audioRegex = /(wav|mp3|ogg|aac)$/;
  var noRegex = /^no$/;

  // audio playability
  // @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
  var audio = new Audio();
  var canUse = {
    wav: '',
    mp3: audio.canPlayType('audio/mpeg;').replace(noRegex,''),
    ogg: audio.canPlayType('audio/ogg; codecs="vorbis"').replace(noRegex,''),
    aac: audio.canPlayType('audio/aac;').replace(noRegex,''),
  };

  /**
   * Join a path with proper separators.
   * @see https://stackoverflow.com/a/43888647/2124254
   */
  function joinPath() {
    var path = [], i = 0;

    for (; i < arguments.length; i++) {
      if (arguments[i]) {

        // replace slashes at the beginning or end of a path
        // replace 2 or more slashes at the beginning of the first path to
        // preserve root routes (/root)
        path.push( arguments[i].trim().replace(new RegExp('(^[\/]{' + (path[0] ? 1 : 2) + ',}|[\/]*$)', 'g'), '') );
      }
    }

    return path.join('/');
  }

  /**
   * Get the extension of an asset.
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  function getExtension(url) {
    return url.split('.').pop();
  }

  /**
   * Get the name of an asset.
   *
   * @param {string} url - The URL to the asset.
   *
   * @returns {string}
   */
  function getName(url) {
    var name = url.replace('.' + getExtension(url), '');

    // remove slash if there is no folder in the path
    return (name.indexOf('/') == 0 && name.lastIndexOf('/') == 0 ? name.substr(1) : name);
  }

  /**
   * Load an Image file. Uses imagePath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string} url - The URL to the Image file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Image.
   *
   * @example
   * kontra.loadImage('car.png');
   * kontra.loadImage('autobots/truck.png');
   */
  function loadImage(url) {
    var name = getName(url);
    var image = new Image();

    var self = kontra.assets;
    var imageAssets = self.images;

    url = joinPath(self.imagePath, url);

    return new Promise(function(resolve, reject) {
      image.onload = function loadImageOnLoad() {
        imageAssets[name] = imageAssets[url] = this;
        resolve(this);
      };

      image.onerror = function loadImageOnError() {
        reject('Unable to load image ' + url);
      };

      image.src = url;
    });
  }

  /**
   * Load an Audio file. Supports loading multiple audio formats which will be resolved by
   * the browser in the order listed. Uses audioPath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string|string[]} url - The URL to the Audio file.
   *
   * @returns {Promise} A deferred promise. Promise resolves with the Audio.
   *
   * @example
   * kontra.loadAudio('sound_effects/laser.mp3');
   * kontra.loadAudio(['explosion.mp3', 'explosion.m4a', 'explosion.ogg']);
   */
  function loadAudio(url) {
    var self = kontra.assets;
    var audioAssets = self.audio;
    var audioPath = self.audioPath;
    var source, name, playableSource, audio, i;

    if (!Array.isArray(url)) {
      url = [url];
    }

    return new Promise(function(resolve, reject) {
      // determine which audio format the browser can play
      for (i = 0; (source = url[i]); i++) {
        if ( canUse[getExtension(source)] ) {
          playableSource = source;
          break;
        }
      }

      if (!playableSource) {
        reject('cannot play any of the audio formats provided');
      }
      else {
        name = getName(playableSource);
        audio = new Audio();
        source = joinPath(audioPath, playableSource);

        audio.addEventListener('canplay', function loadAudioOnLoad() {
          audioAssets[name] = audioAssets[source] = this;
          resolve(this);
        });

        audio.onerror = function loadAudioOnError() {
          reject('Unable to load audio ' + source);
        };

        audio.src = source;
        audio.load();
      }
    });
  }

  /**
   * Load a data file (be it text or JSON). Uses dataPath to resolve URL.
   * @memberOf kontra.assets
   * @private
   *
   * @param {string} url - The URL to the data file.
   *
   * @returns {Promise} A deferred promise. Resolves with the data or parsed JSON.
   *
   * @example
   * kontra.loadData('bio.json');
   * kontra.loadData('dialog.txt');
   */
  function loadData(url) {
    var name = getName(url);
    var req = new XMLHttpRequest();

    var self = kontra.assets;
    var dataAssets = self.data;

    url = joinPath(self.dataPath, url);

    return new Promise(function(resolve, reject) {
      req.addEventListener('load', function loadDataOnLoad() {
        var data = req.responseText;

        if (req.status !== 200) {
          return reject(data);
        }

        try {
          data = JSON.parse(data);
        }
        catch(e) {}

        dataAssets[name] = dataAssets[url] = data;
        resolve(data);
      });

      req.open('GET', url, true);
      req.send();
    });
  }

  /**
   * Object for loading assets.
   */
  kontra.assets = {
    // all assets are stored by name as well as by URL
    images: {},
    audio: {},
    data: {},

    // base asset path for determining asset URLs
    imagePath: '',
    audioPath: '',
    dataPath: '',

    /**
     * Load an Image, Audio, or data file.
     * @memberOf kontra.assets
     *
     * @param {string|string[]} - Comma separated list of assets to load.
     *
     * @returns {Promise}
     *
     * @example
     * kontra.loadAsset('car.png');
     * kontra.loadAsset(['explosion.mp3', 'explosion.ogg']);
     * kontra.loadAsset('bio.json');
     * kontra.loadAsset('car.png', ['explosion.mp3', 'explosion.ogg'], 'bio.json');
     */
    load: function loadAsset() {
      var promises = [];
      var url, extension, asset, i, promise;

      for (i = 0; (asset = arguments[i]); i++) {
        url = (Array.isArray(asset) ? asset[0] : asset);

        extension = getExtension(url);
        if (extension.match(imageRegex)) {
          promise = loadImage(asset);
        }
        else if (extension.match(audioRegex)) {
          promise = loadAudio(asset);
        }
        else {
          promise = loadData(asset);
        }

        promises.push(promise);
      }

      return Promise.all(promises);
    },

    // expose properties for testing
    _canUse: canUse,
  };
})(Promise);