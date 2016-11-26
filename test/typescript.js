import * as tt from 'typescript-definition-tester'

describe('TypeScript definitions', function () {
  it('should compile against types.d.ts', (done) => {
    tt.compile(
      [__dirname + '/typescript.types.ts'],
      {},
      () => done()
    )
  })
})
