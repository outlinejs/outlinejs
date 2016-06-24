/**
 * Build support module.
 * @module outlinejs/utils/build/tasks
 */

import watchify from 'watchify';
import partialify from 'partialify';
import vinylSource from 'vinyl-source-stream';
import vinylBuffer from 'vinyl-buffer';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import merge2 from 'merge2';
import nconf from 'nconf';
import fs from 'fs';
import gettext from 'babel-jsxgettext';
import po2json from 'gulp-po2json';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import mocaccino from 'mocaccino';
import glob from 'glob';
import phantomic from 'phantomic';
import httpProxy from 'http-proxy';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

/**
 * Class for registering gulp task for building an outlineJs based project
 */
export default class {
  /**
   * Initialize the build utils class.
   * @param {Object} gulp - A gulp instance reference
   * @param {Object} browserify - A browserify instance reference
   */
  constructor(gulp, browserify, eslint) {
    this.gulp = gulp;
    this.browserify = browserify;
    this.projectJsEntry = './project/main.js';
    this.eslint = eslint;
  }

  /**
   * Set main project javascript file.
   * @param {string} value=./project/main.js - The file path.
   */
  set projectEntry(value) {
    this.projectJsEntry = value;
  }

  /**
   * Gets main javascript filename.
   * @returns {string}
   */
  getMainFile() {
    return /[^\/]+$/.exec(this.projectJsEntry)[0];
  }

  /**
   * Gets an initialized browserify object.
   * @param {boolean} debug - Compile with debug support
   * @param {boolean} forNode - Compile for node js (server-side)
   * @param {boolean} watch - Use watchify
   * @param {Array.<string>} files - Browserify entries
   */
  getBrowserify(debug = false, forNode = false, watch = false, files = [this.projectJsEntry]) {
    var b = this.browserify(
      Object.assign({}, watch ? watchify.args : {}, {
        entries: files,
        debug: debug
      })
    );
    b.on('log', $.util.log);
    if (forNode) {
      b = b
        .require('./.tmp/main.html', {expose: '__main_html'})
        .exclude('http')
        .exclude('https')
        .exclude('url')
        .exclude('fs')
        .exclude('querystring')
        .exclude('buffer')
        .exclude('console-browserify');
    }
    b = b.exclude('__main_html');
    //include env
    b = b.require('./.tmp/env.json', {expose: '__outline_env'})
      .exclude('__outline_env');
    //include language catalogs
    var catalogs = glob.sync('.tmp/locale/*.json', {realpath: true});
    for (const catalog of catalogs) {
      var content = require(catalog);
      b = b.require(catalog, {expose: `__locale_${content.locale_data.messages[''].lang}`});
    }
    //watchify support
    if (watch) {
      b = watchify(b);
    }
    //transformations
    b = b.transform(partialify);
    return b;
  }

  /**
   * Gets browserify bundle.
   * @param {Object} b - A browserify instance
   * @param {boolean} clientMode - Compile for browser
   * @returns {Object} A browserify bundle
   */
  getBrowserifyBundle(b, clientMode = true) {
    var bundle = b.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(vinylSource(this.getMainFile()))
      .pipe(vinylBuffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.sourcemaps.write('./')); // writes .map file
    if (clientMode) {
      bundle = bundle
        .pipe(this.gulp.dest('./.tmp/scripts'))
        .on('end', function () {
          reload();
        });
    } else {
      bundle = bundle
        .pipe(this.gulp.dest('./.tmp/node-scripts'));
    }
    return bundle;
  }

  /**
   * Starts eslint.
   * @param {string} files - Source files to process as a glob pattern.
   * @param {Object} [options] - eslint options
   * @returns {Function} The eslint function
   */
  lint(files, options) {
    return () => {
      return this.gulp.src(files)
        .pipe(reload({stream: true, once: true}))
        .pipe(this.eslint(options))
        .pipe(this.eslint.format())
        .pipe($.if(!browserSync.active, this.eslint.failAfterError()));
    };
  }

  /**
   * Loads gulp tasks for outlineJs.
   */
  load() {
    this.gulp.task('ojs:env', (cb) => {
      //only env vars with BROWSER_ prefix are exposed
      var safeRegEx = new RegExp('^BROWSER_');
      var env = nconf.env().stores.env.store;
      var safeEnv = {};
      for (var k of Object.keys(env)) {
        if (safeRegEx.test(k)) {
          safeEnv[k.replace(safeRegEx, '')] = env[k];
        }
      }
      try {
        fs.mkdirSync('./.tmp/');
      } catch (ex) {
      } //eslint-disable-line no-empty
      fs.writeFile('./.tmp/env.json', JSON.stringify(safeEnv), (err) => {
        if (err) {
          $.util.log(err);
        }
        cb();
      });
    });

    this.gulp.task('ojs:node-html', () => {
      return this.gulp.src('project/main.html')
        .pipe($.useref({searchPath: ['.tmp', '.'], noAssets: true}))
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(this.gulp.dest('.tmp'));
    });

    this.gulp.task('ojs:js-build', ['ojs:node-html', 'ojs:env', 'ojs:locale-build'], () => {
      var clientBundle = this.getBrowserifyBundle(this.getBrowserify());
      var serverBundle = this.getBrowserifyBundle(this.getBrowserify(false, true, false), false);
      return merge2(clientBundle, serverBundle);
    });

    this.gulp.task('ojs:js-watch', ['ojs:node-html', 'ojs:env'], () => {
      var bc = this.getBrowserify(true, false, true);
      var bs = this.getBrowserify(true, true, true);
      var clientBundle = this.getBrowserifyBundle(bc);
      var serverBundle = this.getBrowserifyBundle(bs, false);
      bc.on('update', () => {
        this.getBrowserifyBundle(bc);
      });
      bs.on('update', () => {
        this.getBrowserifyBundle(bs, false);
      });
      return merge2(clientBundle, serverBundle);
    });

    this.gulp.task('ojs:pot', () => {
      gettext(glob.sync('project/**/*.js'), 'locale/template.pot', (err) => {
        if (err) {
          $.util.log(err);
        }
      });
    });

    this.gulp.task('ojs:locale-build', () => {
      return this.gulp.src('locale/*.po')
        .pipe(po2json({format: 'jed1.x'}))
        .pipe(this.gulp.dest('.tmp/locale'))
        .pipe(this.gulp.dest('dist/locale'));
    });

    this.gulp.task('ojs:styles', () => {
      return this.gulp.src('project/**/styles/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
          outputStyle: 'expanded',
          precision: 10,
          includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.postcss([
          require('autoprefixer')({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']})
        ]))
        .pipe($.concat('main.css'))
        .pipe($.sourcemaps.write())
        .pipe(this.gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
    });

    this.gulp.task('ojs:lint', this.lint('project/**/*.js'));

    this.gulp.task('ojs:lint-test', this.lint('project/**/tests/*.js', {
      env: {
        mocha: true
      }
    }));

    this.gulp.task('ojs:html', ['ojs:js-build', 'ojs:styles'], () => {
      return this.gulp.src('project/*.html')
        .pipe($.useref({searchPath: ['.tmp', '.']}))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano()))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe(this.gulp.dest('dist'));
    });

    this.gulp.task('ojs:node-app', ['ojs:js-build'], () => {
      return this.gulp.src('.tmp/node-scripts/*.js')
        .pipe($.uglify())
        .pipe(this.gulp.dest('dist/node-scripts'));
    });

    this.gulp.task('ojs:images', ['ojs:images-vendor'], () => {
      return this.gulp.src('project/**/images/**/*')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{cleanupIDs: false}]
        }))
          .on('error', function (err) {
            $.util.log(err);
            this.end();
          })))
        .pipe(this.gulp.dest('dist/static'));
    });

    this.gulp.task('ojs:images-vendor', () => {
      return this.gulp.src('node_modules/**/*.{png,jpg,jpeg,gif,bmp,svg}')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{cleanupIDs: false}]
        }))
          .on('error', function (err) {
            $.util.log(err);
            this.end();
          })))
        .pipe(this.gulp.dest('.tmp/static/vendor-images'))
        .pipe(this.gulp.dest('dist/static/vendor-images'));
    });

    this.gulp.task('ojs:fonts-apps', () => {
      return this.gulp.src('project/**/media/fonts/**/*')
        .pipe(this.gulp.dest('.tmp/static'))
        .pipe(this.gulp.dest('dist/static'));
    });

    this.gulp.task('ojs:fonts-vendor', () => {
      return this.gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', () => {
      })
        .concat('node_modules/**/*.{eot,svg,ttf,woff,woff2}')
        .concat('!node_modules/gulp-if/**/*')
        .concat('!node_modules/browser-sync-ui/**/*')
        .concat('!node_modules/ternary-stream/**/*')
        .concat('!node_modules/nodemon/**/*'))
        .pipe(this.gulp.dest('.tmp/static/vendor-fonts'))
        .pipe(this.gulp.dest('dist/static/vendor-fonts'));
    });

    this.gulp.task('ojs:fonts', ['ojs:fonts-apps', 'ojs:fonts-vendor']);

    this.gulp.task('ojs:extras', () => {
      return this.gulp.src([
        'project/*.*',
        '!project/*.html',
        '!project/*.js'
      ], {
        dot: true
      }).pipe(this.gulp.dest('dist'));
    });

    this.gulp.task('ojs:clean', del.bind(null, ['.tmp', 'dist']));

    this.gulp.task('ojs:wiredep', () => {
      this.gulp.src('project/styles/*.scss')
        .pipe(wiredep({
          ignorePath: /^(\.\.\/)+/
        }))
        .pipe(this.gulp.dest('project/styles'));

      this.gulp.src('project/*.html')
        .pipe(wiredep({
          ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(this.gulp.dest('project'));
    });

    this.gulp.task('ojs:test', ['ojs:env', 'ojs:lint-test'], () => {
      var files = glob.sync('project/**/tests/*.js');
      var b = this.getBrowserify(false, false, false, files)
        .plugin(mocaccino, {reporter: 'spec'})
        .bundle();

      phantomic(b, {
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

    this.gulp.task('ojs:build', ['ojs:lint', 'ojs:test', 'ojs:html', 'ojs:node-app', 'ojs:images', 'ojs:fonts', 'ojs:extras', 'ojs:locale-build'], () => {
      return this.gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
    });

    this.gulp.task('ojs:serve', ['ojs:js-watch', 'ojs:styles', 'ojs:fonts', 'ojs:pot', 'ojs:locale-build', 'ojs:images-vendor'], () => {
      this.gulp.watch('project/**/styles/*.scss', ['ojs:styles']);
      this.gulp.watch('project/**/media/fonts/**/*', ['ojs:fonts-apps']);
      this.gulp.watch('bower.json', ['ojs:wiredep', 'ojs:fonts-vendor']);
      this.gulp.watch('package.json', ['ojs:fonts-vendor']); //TODO: and other tasks :)
      this.gulp.watch('project/**/*.js', ['ojs:pot']);
      this.gulp.watch('locale/*.po', ['ojs:locale-build']);

      this.gulp.watch([
        'project/*.html',
        'project/**/media/fonts/**/*',
        '.tmp/static/vendor-fonts/**/*',
        '.tmp/styles/**/*',
        '.tmp/locale/*.json'
      ]).on('change', reload);

      var nmStarted = false;

      $.nodemon({
        script: './.tmp/node-scripts/main.js',
        watch: './.tmp/node-scripts/',
        ext: 'js',
        delay: 1000
      }).on('start', function () {
        if (!nmStarted) {
          nmStarted = true;
          var proxy = httpProxy.createProxyServer({
            target: 'http://localhost:1337/'
          }).on('error', (err) => {
            $.util.log(err);
          });
          setTimeout(() => {
            browserSync({
              notify: false,
              port: 9000,
              server: {
                baseDir: ['.tmp', 'project'],
                routes: {
                  '/bower_components': 'bower_components',
                  '/static': 'project',
                  '/static/vendor-fonts/': '.tmp/static/vendor-fonts'
                },
                middleware: (req, res, next) => {
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

    this.gulp.task('ojs:serve-dist', () => {
      return $.nodemon({
        script: './dist/node-scripts/main.js',
        watch: './dist/node-scripts/'
      }).on('start', function () {
        browserSync({
          notify: false,
          proxy: 'http://localhost:1337',
          serveStatic: ['./dist/'],
          port: 9001
        });
      });
    });
  }
}
