import * as tt from 'typescript-definition-tester'

describe('TypeScript definitions', function () {
  this.timeout(4000);
  it('should compile against types.d.ts', (done) => {
    tt.compile(
      [__dirname + '/typescript.types.ts'],
      {},
      (e) => done(e)
    )
  })
})
