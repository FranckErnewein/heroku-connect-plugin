'use strict'
const api = require('../../lib/connect/api.js')
const regions = require('../../lib/connect/regions.js')
const cli = require('heroku-cli-util')
const co = require('co')

module.exports = {
  topic: 'connect:mapping',
  command: 'delete',
  description: 'Delete an existing mapping',
  help: 'Delete an existing mapping',
  args: [
    {name: 'mapping'}
  ],
  flags: [
    {name: 'resource', description: 'specific connection resource name', hasValue: true},
    {name: 'confirm', hasValue: true},
    regions.flag
  ],
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(function * (context, heroku) {
    context.region = yield regions.determineRegion(context, heroku)
    yield cli.confirmApp(context.app, context.flags.confirm)

    yield cli.action('deleting mapping', co(function * () {
      let connection = yield api.withConnection(context, heroku)
      let mapping = yield api.withMapping(connection, context.args.mapping)
      let response = yield api.request(context, 'DELETE', '/api/v3/mappings/' + mapping.id)
      if (response.statusCode !== 204) {
        throw new Error(response.json.message || 'unknown error')
      }
    }))
  }))
}
