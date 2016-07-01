'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Build support module.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module outlinejs/utils/build/tasks
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _watchify = require('watchify');

var _watchify2 = _interopRequireDefault(_watchify);

var _partialify = require('partialify');

var _partialify2 = _interopRequireDefault(_partialify);

var _vinylSourceStream = require('vinyl-source-stream');

var _vinylSourceStream2 = _interopRequireDefault(_vinylSourceStream);

var _vinylBuffer = require('vinyl-buffer');

var _vinylBuffer2 = _interopRequireDefault(_vinylBuffer);

var _gulpLoadPlugins = require('gulp-load-plugins');

var _gulpLoadPlugins2 = _interopRequireDefault(_gulpLoadPlugins);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _merge = require('merge2');

var _merge2 = _interopRequireDefault(_merge);

var _nconf = require('nconf');

var _nconf2 = _interopRequireDefault(_nconf);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _babelJsxgettext = require('babel-jsxgettext');

var _babelJsxgettext2 = _interopRequireDefault(_babelJsxgettext);

var _gulpPo2json = require('gulp-po2json');

var _gulpPo2json2 = _interopRequireDefault(_gulpPo2json);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _wiredep = require('wiredep');

var _mocaccino = require('mocaccino');

var _mocaccino2 = _interopRequireDefault(_mocaccino);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _phantomic = require('phantomic');

var _phantomic2 = _interopRequireDefault(_phantomic);

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _insertModuleGlobals = require('insert-module-globals');

var _insertModuleGlobals2 = _interopRequireDefault(_insertModuleGlobals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = (0, _gulpLoadPlugins2.default)();
var reload = _browserSync2.default.reload;

/**
 * Class for registering gulp task for building an outlineJs based project
 */

var _class = function () {
  /**
   * Initialize the build utils class.
   * @param {Object} gulp - A gulp instance reference
   * @param {Object} browserify - A browserify instance reference
   */

  function _class(gulp, browserify, eslint) {
    _classCallCheck(this, _class);

    this.gulp = gulp;
    this.browserify = browserify;
    this.projectJsEntry = './project/main.js';
    this.eslint = eslint;
  }

  /**
   * Set main project javascript file.
   * @param {string} value=./project/main.js - The file path.
   */


  _createClass(_class, [{
    key: 'getMainFile',


    /**
     * Gets main javascript filename.
     * @returns {string}
     */
    value: function getMainFile() {
      return (/[^\/]+$/.exec(this.projectJsEntry)[0]
      );
    }

    /**
     * Gets an initialized browserify object.
     * @param {boolean} debug - Compile with debug support
     * @param {boolean} forNode - Compile for node js (server-side)
     * @param {boolean} watch - Use watchify
     * @param {Array.<string>} files - Browserify entries
     */

  }, {
    key: 'getBrowserify',
    value: function getBrowserify() {
      var debug = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      var forNode = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var watch = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      var files = arguments.length <= 3 || arguments[3] === undefined ? [this.projectJsEntry] : arguments[3];

      var initialOpts = {};
      if (forNode) {
        initialOpts = Object.assign(initialOpts, {
          // builtins: false,
          // commondir: false,
          // insertGlobalVars: {
          //   __filename: insertGlobals.vars.__filename,
          //   __dirname: insertGlobals.vars.__dirname,
          //   process: function () {
          //     return;
          //   }
          // },
          // browserField: false
        });
      }
      var b = this.browserify(Object.assign(initialOpts, watch ? _watchify2.default.args : {}, {
        entries: files,
        debug: debug
      }));
      b.on('log', $.util.log);
      if (forNode) {
        b = b.require('./.tmp/main.html', { expose: '__main_html' }).exclude('http').exclude('https').exclude('url').exclude('fs').exclude('querystring').exclude('buffer').exclude('console-browserify');
      }
      b = b.exclude('__main_html');
      //include env
      b = b.require('./.tmp/env.json', { expose: '__outline_env' }).exclude('__outline_env');
      //include language catalogs
      var catalogs = _glob2.default.sync('.tmp/locale/*.json', { realpath: true });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = catalogs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var catalog = _step.value;

          var content = require(catalog);
          b = b.require(catalog, { expose: '__locale_' + content.locale_data.messages[''].lang });
        }
        //watchify support
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (watch) {
        b = (0, _watchify2.default)(b);
      }
      //transformations
      b = b.transform(_partialify2.default);
      return b;
    }

    /**
     * Gets browserify bundle.
     * @param {Object} b - A browserify instance
     * @param {boolean} clientMode - Compile for browser
     * @returns {Object} A browserify bundle
     */

  }, {
    key: 'getBrowserifyBundle',
    value: function getBrowserifyBundle(b) {
      var clientMode = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var bundle = b.bundle().on('error', $.util.log.bind($.util, 'Browserify Error')).pipe((0, _vinylSourceStream2.default)(this.getMainFile())).pipe((0, _vinylBuffer2.default)()).pipe($.sourcemaps.init({ loadMaps: true })).pipe($.sourcemaps.write('./')); // writes .map file
      if (clientMode) {
        bundle = bundle.pipe(this.gulp.dest('./.tmp/scripts')).on('end', function () {
          reload();
        });
      } else {
        bundle = bundle.pipe(this.gulp.dest('./.tmp/node-scripts'));
      }
      return bundle;
    }

    /**
     * Starts eslint.
     * @param {string} files - Source files to process as a glob pattern.
     * @param {Object} [options] - eslint options
     * @returns {Function} The eslint function
     */

  }, {
    key: 'lint',
    value: function lint(files, options) {
      var _this = this;

      return function () {
        return _this.gulp.src(files).pipe(reload({ stream: true, once: true })).pipe(_this.eslint(options)).pipe(_this.eslint.format()).pipe($.if(!_browserSync2.default.active, _this.eslint.failAfterError()));
      };
    }

    /**
     * Loads gulp tasks for outlineJs.
     */

  }, {
    key: 'load',
    value: function load() {
      var _this2 = this;

      this.gulp.task('ojs:env', function (cb) {
        //only env vars with BROWSER_ prefix are exposed
        var safeRegEx = new RegExp('^BROWSER_');
        var env = _nconf2.default.env().stores.env.store;
        var safeEnv = {};
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(env)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var k = _step2.value;

            if (safeRegEx.test(k)) {
              safeEnv[k.replace(safeRegEx, '')] = env[k];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        try {
          _fs2.default.mkdirSync('./.tmp/');
        } catch (ex) {} //eslint-disable-line no-empty
        _fs2.default.writeFile('./.tmp/env.json', JSON.stringify(safeEnv), function (err) {
          if (err) {
            $.util.log(err);
          }
          cb();
        });
      });

      this.gulp.task('ojs:node-html', function () {
        return _this2.gulp.src('project/main.html').pipe($.useref({ searchPath: ['.tmp', '.'], noAssets: true })).pipe($.htmlmin({ collapseWhitespace: true })).pipe(_this2.gulp.dest('.tmp'));
      });

      this.gulp.task('ojs:js-build', ['ojs:node-html', 'ojs:env', 'ojs:locale-build'], function () {
        var clientBundle = _this2.getBrowserifyBundle(_this2.getBrowserify());
        var serverBundle = _this2.getBrowserifyBundle(_this2.getBrowserify(false, true, false), false);
        return (0, _merge2.default)(clientBundle, serverBundle);
      });

      this.gulp.task('ojs:js-watch', ['ojs:node-html', 'ojs:env'], function () {
        var bc = _this2.getBrowserify(true, false, true);
        var bs = _this2.getBrowserify(true, true, true);
        var clientBundle = _this2.getBrowserifyBundle(bc);
        var serverBundle = _this2.getBrowserifyBundle(bs, false);
        bc.on('update', function () {
          _this2.getBrowserifyBundle(bc);
        });
        bs.on('update', function () {
          _this2.getBrowserifyBundle(bs, false);
        });
        return (0, _merge2.default)(clientBundle, serverBundle);
      });

      this.gulp.task('ojs:pot', function () {
        (0, _babelJsxgettext2.default)(_glob2.default.sync('project/**/*.js'), 'locale/template.pot', function (err) {
          if (err) {
            $.util.log(err);
          }
        });
      });

      this.gulp.task('ojs:locale-build', function () {
        return _this2.gulp.src('locale/*.po').pipe((0, _gulpPo2json2.default)({ format: 'jed1.x' })).pipe(_this2.gulp.dest('.tmp/locale')).pipe(_this2.gulp.dest('dist/locale'));
      });

      this.gulp.task('ojs:styles', function () {
        return _this2.gulp.src('project/**/styles/*.scss').pipe($.plumber()).pipe($.sourcemaps.init()).pipe($.sass.sync({
          outputStyle: 'expanded',
          precision: 10,
          includePaths: ['.']
        }).on('error', $.sass.logError)).pipe($.postcss([require('autoprefixer')({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] })])).pipe($.concat('main.css')).pipe($.sourcemaps.write()).pipe(_this2.gulp.dest('.tmp/styles')).pipe(reload({ stream: true }));
      });

      this.gulp.task('ojs:lint', this.lint('project/**/*.js'));

      this.gulp.task('ojs:lint-test', this.lint('project/**/tests/*.js', {
        env: {
          mocha: true
        }
      }));

      this.gulp.task('ojs:html', ['ojs:js-build', 'ojs:styles'], function () {
        return _this2.gulp.src('project/*.html').pipe($.useref({ searchPath: ['.tmp', '.'] })).pipe($.if('*.js', $.uglify())).pipe($.if('*.css', $.cssnano())).pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true }))).pipe(_this2.gulp.dest('dist'));
      });

      this.gulp.task('ojs:node-app', ['ojs:js-build'], function () {
        return _this2.gulp.src('.tmp/node-scripts/*.js').pipe($.uglify()).pipe(_this2.gulp.dest('dist/node-scripts'));
      });

      this.gulp.task('ojs:images', ['ojs:images-vendor'], function () {
        return _this2.gulp.src('project/**/images/**/*').pipe($.if($.if.isFile, $.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{ cleanupIDs: false }]
        })).on('error', function (err) {
          $.util.log(err);
          this.end();
        }))).pipe(_this2.gulp.dest('dist/static'));
      });

      this.gulp.task('ojs:images-vendor', function () {
        return _this2.gulp.src('node_modules/**/*.{png,jpg,jpeg,gif,bmp,svg}').pipe($.if($.if.isFile, $.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{ cleanupIDs: false }]
        })).on('error', function (err) {
          $.util.log(err);
          this.end();
        }))).pipe(_this2.gulp.dest('.tmp/static/vendor-images')).pipe(_this2.gulp.dest('dist/static/vendor-images'));
      });

      this.gulp.task('ojs:fonts-apps', function () {
        return _this2.gulp.src('project/**/media/fonts/**/*').pipe(_this2.gulp.dest('.tmp/static')).pipe(_this2.gulp.dest('dist/static'));
      });

      this.gulp.task('ojs:fonts-vendor', function () {
        return _this2.gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function () {}).concat('node_modules/**/*.{eot,svg,ttf,woff,woff2}').concat('!node_modules/gulp-if/**/*').concat('!node_modules/browser-sync-ui/**/*').concat('!node_modules/ternary-stream/**/*').concat('!node_modules/nodemon/**/*')).pipe(_this2.gulp.dest('.tmp/static/vendor-fonts')).pipe(_this2.gulp.dest('dist/static/vendor-fonts'));
      });

      this.gulp.task('ojs:fonts', ['ojs:fonts-apps', 'ojs:fonts-vendor']);

      this.gulp.task('ojs:extras', function () {
        return _this2.gulp.src(['project/*.*', '!project/*.html', '!project/*.js'], {
          dot: true
        }).pipe(_this2.gulp.dest('dist'));
      });

      this.gulp.task('ojs:clean', _del2.default.bind(null, ['.tmp', 'dist']));

      this.gulp.task('ojs:wiredep', function () {
        _this2.gulp.src('project/styles/*.scss').pipe((0, _wiredep.stream)({
          ignorePath: /^(\.\.\/)+/
        })).pipe(_this2.gulp.dest('project/styles'));

        _this2.gulp.src('project/*.html').pipe((0, _wiredep.stream)({
          ignorePath: /^(\.\.\/)*\.\./
        })).pipe(_this2.gulp.dest('project'));
      });

      this.gulp.task('ojs:test', ['ojs:env', 'ojs:pot', 'ojs:locale-build', 'ojs:lint-test'], function () {
        var files = _glob2.default.sync('project/**/tests/*.js');
        var b = _this2.getBrowserify(false, false, false, files).plugin(_mocaccino2.default, { reporter: 'spec' }).bundle();

        (0, _phantomic2.default)(b, {
          debug: false,
          port: 0,
          brout: true,
          'web-security': false,
          'ignore-ssl-errors': true
        }, function (code) {
          if (code !== 0) {
            process.exit(code);
          }
        }).pipe(process.stdout);
      });

      this.gulp.task('ojs:build', ['ojs:lint', 'ojs:test', 'ojs:html', 'ojs:node-app', 'ojs:images', 'ojs:fonts', 'ojs:extras', 'ojs:locale-build'], function () {
        return _this2.gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
      });

      this.gulp.task('ojs:serve', ['ojs:js-watch', 'ojs:styles', 'ojs:fonts', 'ojs:pot', 'ojs:locale-build', 'ojs:images-vendor'], function () {
        _this2.gulp.watch('project/**/styles/*.scss', ['ojs:styles']);
        _this2.gulp.watch('project/**/media/fonts/**/*', ['ojs:fonts-apps']);
        _this2.gulp.watch('bower.json', ['ojs:wiredep', 'ojs:fonts-vendor']);
        _this2.gulp.watch('package.json', ['ojs:fonts-vendor']); //TODO: and other tasks :)
        _this2.gulp.watch('project/**/*.js', ['ojs:pot']);
        _this2.gulp.watch('locale/*.po', ['ojs:locale-build']);

        _this2.gulp.watch(['project/*.html', 'project/**/media/fonts/**/*', '.tmp/static/vendor-fonts/**/*', '.tmp/styles/**/*', '.tmp/locale/*.json']).on('change', reload);

        var nmStarted = false;
        var proxyServer = process.env.server || '0.0.0.0';
        var proxyPort = parseInt(process.env.port) || 1337;
        var proxyTarget = 'http://' + proxyServer + ':' + proxyPort + '/';
        var portWatch = parseInt(process.env.portWatch) || 9000;
        $.nodemon({
          script: './.tmp/node-scripts/main.js',
          watch: './.tmp/node-scripts/',
          ext: 'js',
          delay: 1000
        }).on('start', function () {
          if (!nmStarted) {
            nmStarted = true;
            var proxy = _httpProxy2.default.createProxyServer({
              target: proxyTarget
            }).on('error', function (err) {
              $.util.log(err);
            });
            setTimeout(function () {
              (0, _browserSync2.default)({
                notify: false,
                port: portWatch,
                server: {
                  baseDir: ['.tmp', 'project'],
                  routes: {
                    '/bower_components': 'bower_components',
                    '/static': 'project',
                    '/static/vendor-fonts/': '.tmp/static/vendor-fonts'
                  },
                  middleware: function middleware(req, res, next) {
                    if (!/(\/scripts)|(\/styles)|(\/static)|(\/bower_components)/.test(req.url)) {
                      proxy.web(req, res);
                    } else {
                      next();
                    }
                  }
                }
              });
            }, 2000);
          }
        });
      });

      this.gulp.task('ojs:serve-dist', function () {
        var proxyServer = process.env.server || '0.0.0.0';
        var proxyPort = parseInt(process.env.port) || 1337;
        var proxyTarget = 'http://' + proxyServer + ':' + proxyPort + '/';
        var portWatchDist = parseInt(process.env.portWatch) || 9001;
        return $.nodemon({
          script: './dist/node-scripts/main.js',
          watch: './dist/node-scripts/'
        }).on('start', function () {
          (0, _browserSync2.default)({
            notify: false,
            proxy: proxyTarget,
            serveStatic: ['./dist/'],
            port: portWatchDist
          });
        });
      });
    }
  }, {
    key: 'projectEntry',
    set: function set(value) {
      this.projectJsEntry = value;
    }
  }]);

  return _class;
}();

exports.default = _class;