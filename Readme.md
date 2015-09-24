
# superagent-pool

  automatic request pooling for superagent. will only make the request once, but return the result
  for each request as if it requested the resource multiple times. Magical.

  Requests only pooled on *idempotent* methods: `GET`, `HEAD`, `OPTIONS`.

## Installation

```
npm install superagent-pool
```

## Usage

```js
var superagent = require('superagent-pool')(require('superagent'))

superagent.get('http://google.com', fn)
superagent.get('http://google.com', fn)
superagent.get('http://google.com', fn)

function end (err, res) {
  // called 3 times, but request is only made once
  console.log(res.status)
}
```

## License

MIT
