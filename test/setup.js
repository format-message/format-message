global.expect = require('chai').expect
require('babel/register')({
	loose: 'all',
	optional: [ 'runtime' ]
})

