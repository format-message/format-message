require('babel/register')({
  loose: 'all',
  optional: [ 'runtime' ],
  auxiliaryCommentBefore: 'istanbul ignore next'
})
