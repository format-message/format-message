# Contributing

Contributions are always welcome, no matter how large or small. Before
contributing, please read the
[code of conduct](https://github.com/thetalecrafter/format-message/blob/master/CODE_OF_CONDUCT.md).

**NOTE:** Please do not send pull requests that fix linting issues. It's
unlikely such issues will stick around long anyway.

## Developing

#### Workflow

* Fork the repository
* Clone your fork and change directory to it (`git clone git@github.com:yourUserName/format-message.git && cd format-message`)
* Install the project dependencies (`npm install`)
* Link your forked clone (`npm link`)
* Develop your changes ensuring you're fetching updates from upstream often
* Ensure the test are passing (`npm test`)
* Create new pull request explaining your proposed change or reference an issue
  in your commit message

#### Code Standards

 * **General**
   * ES6 syntax, except anything that requires the babel runtime.
   * Max of five arguments for functions
   * Max depth of four nested blocks
   * real tabs
 * **Naming**
   * CamelCase all class names
   * camelBack all variable names
 * **Spacing**
   * Spaces after all keywords
   * Spaces before all left curly braces
 * **Comments**
   * Use JSDoc-style comments for methods
   * Single-line comments for ambiguous code
 * **Quotes**
   * Always use single quotes
   * Only use double quotes when the string contains a single quote
 * **Declaration**
   * No unused variables
   * No pollution of global variables and prototypes

## Testing

    $ npm test

## Linting

    $ npm run lint

