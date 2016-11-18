# class-autobind-decorator

A small, customizable, framework-agnostic, ES5-compatible class-level
decorator for automatically binding "class" methods -- i.e., methods on
a constructor's `prototype` object -- to instances, so that `this`
refers to the relevant instance within those methods.

## Features:

- Usable with ES6+ [React](https://facebook.github.io/react/) and [Preact](https://preactjs.com) classes,
but also elsewhere
- Built version is fully ES5-compatible, requiring no ES6+ polyfills
- Supports class methods that have ES6 Symbols as keys
- Accepts configuration options (see examples below), allowing the user to
specify the methods that should or should not be bound (supporting both
named methods and methods with Symbols as keys in this case, as well), and
to specify whether or not to perform certain optimizations
- Does not attempt to redefine methods marked as non-configurable
(checks for configurability first!)
- Conforms to [the ES6+ "legacy" decorator pattern](https://babeljs.io/docs/plugins/transform-decorators/),
and hence is usable as an ES6+ legacy decorator
- Usable as both a "bare," unconfigured decorator (`@autoBindMethods`)
or as a configured decorator (`@autoBindMethods(options)`)
- Documented and tested

## Installation

```js
npm install --save class-autobind-decorator
```

## Usage

Note that this is currently only usable as a "class"-level (or, in ES5
terms, a constructor-function-level) decorator. It can't currently be
used on individual methods. However, the decorator accepts an options
object that can define an array of methods not to bind (using the method
names or Symbol keys; see the use of `methodsToIgnore` in the examples
below, as well as the test cases in the tests).

ES6-style as a "legacy" class decorator, without options:

```js
import autoBindMethods from 'class-autobind-decorator';

@autoBindMethods // You could also use `@autoBindMethods()` if you want.
class Foo {
    someMethod() {
        return this instanceof Foo;
    }
}

const smReference = new Foo().someMethod;
console.log(smReference()); // => `true`
```

ES6-style as a "legacy" class decorator, with options:

```js
import autoBindMethods from 'class-autobind-decorator';

@autoBindMethods({ methodsToIgnore: ['unboundMethod', 'render'] })
class MyComponent extends React.Component {
    someComponentMethod() {
        // Do something with `this` here. If the React `onClick`
        // handler below is triggered, `this` will be bound to the
        // component instance.
    }
    
    unboundMethod() {
        // `this` will not be auto-bound in this method, given the
        // options passed in to the decorator.
    }
    
    // This method will not be bound by `autoBindMethods` either (it
    // doesn't need to be).
    render() {
        return (
            <button onClick={this.someComponentMethod} />
        );
    }
}
```

ES5-style, without options:

```js
var autoBindMethods = require('class-autobind-decorator').default;

var Foo = (function () {
    function Foo () {}
    Foo.prototype.someMethod = function () {
        return this instanceof Foo;
    };
    return Foo;
}());

autoBindMethods(Foo);
var smReference = new Foo().someMethod;
console.log(smReference()); // => `true`
```

ES5-style, with options:

```js
var autoBindMethods = require('class-autobind-decorator').default;
var customAutoBinder = autoBindMethods({
    methodsToIgnore: ['secondMethod']
});

var Foo = (function () {
    function Foo () {}
    Foo.prototype.firstMethod = function () {
        return this instanceof Foo;
    };
    Foo.prototype.secondMethod = function () {
        return this instanceof Foo;
    };
    return Foo;
}());

customAutoBinder(Foo);
var fooInstance = new Foo();
var fmReference = fooInstance.firstMethod;
var smReference = fooInstance.secondMethod;
console.log(fmReference()); // => `true`
console.log(smReference()); // => `false`, due to passed in options
```

## Configuration Options

**methodsToIgnore**: An array of method names that should not be bound if found on the prototype.
See the above examples for usage.

**dontOptimize**: The default behavior of this decorator is to only bind methods to instances once,
and, from that point onward, to store the bound method on the instance itself. You can override
this behavior by setting `dontOptimize` to true. If you do that, the method will be re-bound to the
instance on every access; a bound version of the method will not be stored on the instance itself
(so, a use case for this might be if you need the instance not to be modified at all).

## Building

Clone the repository, run `npm install`, then, in the main (top-level) repo
directory:

```js
npm run build
```

Compiled code will be placed in the `./build` directory. You can also
download compiled code directly from this repository.

## Running Tests

Clone the repository and go to the main (top-level) repo directory. Be
sure to run `npm install` first, and then:

```js
npm run test
```

Tests are specified in the `./tests` directory, and use `mocha` and
`chai`. Running the tests also requires a few extra `babel` dependencies
specified in `package.json`.

## Wait... Why did you write yet another auto-bind decorator?

Well, I'm not currently aware of another project that has *all* of the
features mentioned in the "Features" section, above (the ones I *am*
aware of either hard-code React-specific stuff, or don't check whether
properties are configurable before trying to redefine them, or inadvertently
bind to non-instance objects when methods are accessed first via the prototype,
or can't be used as both "bare" (unconfigured) decorators and configured
decorators, and things like that -- no hate, though!). I also just wanted an
opportunity to work more directly with decorators, so I used it as a
learning experience. :)

## License

[MIT](https://opensource.org/licenses/MIT)
