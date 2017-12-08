# CHANGELOG

## v3.0.1 (12/7/2017)

- Fix type declarations

## v3.0.0 (11/16/2017)

- Ensures that the decorator does not prevent overwriting autobound
  methods on a class/prototype (closes #4), for React 16 interop
- Exports `autoBindMethodsForReact` convenience decorator for easier use
  with React/Preact classes (see #4)
- Does not attempt to autoBind the `constructor` method, ever (no need)
- Better guarantees that property descriptors for autobound properties
  have the same settings with respect to enumerability, writability, etc.
- Built files are now UMD modules
- Additional tests

## v2.3.0 (8/4/2017)

- Improve typings (and types exposed for consumption)

## v2.2.1 (1/27/2017)

- Remove .babelrc from npm package for React Native use (closes #3)

## v2.2.0 (12/17/2016)

- Add TypeScript declaration file (closes #1)
- Make newly-defined property have same enumerability as property being
  overridden
- Add additional tests and comments

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

