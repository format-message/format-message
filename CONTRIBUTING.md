# Contributing

Contributions are always welcome, no matter how large or small. Before
contributing, please read the
[code of conduct](https://github.com/thetalecrafter/format-message/blob/master/CODE_OF_CONDUCT.md).

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

* Use ES 2015 syntax, except anything that requires the babel runtime.
* Follow [JavaScript Standard Style](https://github.com/feross/standard).

## Testing

    $ npm test

## Linting

    $ npm run lint
