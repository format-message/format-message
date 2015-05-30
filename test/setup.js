require('babel/register')({
  loose: 'all',
  optional: [ 'runtime' ],
  auxiliaryComment: 'istanbul ignore next'
})
