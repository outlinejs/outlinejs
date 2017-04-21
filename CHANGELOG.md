## 2.3.1

BUG FIXES:

  - query property on client url class is not working well, the first property has been parsed as '?propertyName' instead of 'propertyName'


## 2.3.0

FEATURES:

  - Rename BROWSER_ env variables conventions to OJS_
  - Add configurable port and ip binding of node process through OJS_NODEJS_PORT and OJS_NODEJS_IP env variables
  - Add url property on Request class, based on Url class (https://url.spec.whatwg.org/)
  - Refactory RouteUtils.reverse() signature adding request object as required

BUG FIXES:

  - cssnano is not running on ojs:styles gulp task
  - uglifyjs is not running on development gulp tasks pipeline
