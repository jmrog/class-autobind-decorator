# CHANGELOG

## v2.1.0 (11/18/2016)

- Add optimizations (add methods to instances and unnecessary re-binding)
- Add `dontOptimize` flag for overridding optimizations if necessary
- Actually make this thing work for classes with more than one instance
  (whoops!). This is the *real* fix for issue #2.

## v2.0.0 (11/16/2016)

- Prevent decorator from binding to non-instances on early reads (fixes #2)

## v1.0.2 (9/17/2016)

- Add repository information to package

## v1.0.1 (9/11/2016)

- Fix typo in package.json ("main" entry)

## v1.0.0 (9/11/2016)

- Initial release

