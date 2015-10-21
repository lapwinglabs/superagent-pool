/**
 * Module dependencies
 */

var debug = require('debug')('superagent:pool')
var qs = require('querystring')

/**
 * Idempotent Methods
 */

var idempotent = /^(GET|HEAD|OPTIONS)$/

/**
 * Export `superagent-pool`
 */

module.exports = pool

/**
 * Initialize the `pool`
 *
 * @param {Superagent} superagent
 * @return {Superagent}
 */

function pool (superagent) {
  var end = superagent.Request.prototype.end
  var pending = {}

  // Monkey-path end
  superagent.Request.prototype.end = function (fn) {
    if (!idempotent.test(this.method)) return end.apply(this, arguments)
    var key = serialize(this)

    // already a request out, wait till it's response
    if (pending[key]) {
      debug('%s already requested, waiting for another request', key)
      pending[key]
        .once('response', function(res) { fn(null, res) })
        .once('error', function(err) { fn(err) })
    } else {
      // first request with this url, make the request with this instance
      pending[key] = this
      end.call(this, function (err, res) {
        debug('%s finished up', key)
        delete pending[key]
        return fn(err, res)
      })
    }

    // return instance that is requesting
    return pending[key]
  }

  return superagent
}

/**
 * Serialize the request
 *
 * @param {Object} request
 * @return {String}
 */

function serialize (request) {
  var query = qs.stringify(request.qs)
  return request.method + ' ' + request.url + (query ? '?' + query : '')
}
