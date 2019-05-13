const util = require('util');
const stringify = require('json-stable-stringify');
const path = require('path');
const {writeFile} = require('../util');
const {omit} = require('lodash');
const {compile} = require('ejs');
const {REPO_ROOT, readFile, modifyFile} = require('../util');
const rimraf = util.promisify(require('rimraf'));
const mkdirp = util.promisify(require('mkdirp'));

exports.tasks = [{
  title: 'Generate Taskcluster-Client-Web',
  requires: ['apis'],
  provides: ['target-taskcluster-client-web'],
  run: async (requirements, utils) => {
    const apis = requirements['apis'];

    // clean up the clients directory to eliminate any "leftovers"
    await rimraf(path.join(REPO_ROOT, 'clients/client-web/src/clients'));
    await mkdirp(path.join(REPO_ROOT, 'clients/client-web/src/clients'));

    utils.status({message: 'index'});
    await modifyFile(path.join('clients/client-web/src/index.js'), async contents => {
      const exports = Object
        .keys(apis)
        .sort()
        .map(name => `export { default as ${name} } from './clients/${name}';`);

      return contents.replace(
        /\/\/ AUTOGENERATED-START([\s\S]*?)\/\/ AUTOGENERATED-END/gmi,
        `// AUTOGENERATED-START\n${exports.join('\n')}\n// AUTOGENERATED-END`
      );
    });

    const template = compile(await readFile('clients/client-web/templates/client.ejs'));

    for (let name of Object.keys(apis)) {
      const {reference} = apis[name];

      utils.status({message: name});
      await writeFile(
        path.join('clients/client-web/src', `clients/${name}.js`),
        template({
          name,
          stringify,
          omit,
          rootUrl: process.env.TASKCLUSTER_ROOT_URL,
          serviceName: reference.serviceName,
          serviceVersion: reference.apiVersion,
          exchangePrefix: reference.exchangePrefix,
          methods: reference.entries
            .filter(({type}) => type === 'function')
            .map(({...entry}) => {
              if (entry.input) {
                entry.input = true;
              }

              if (entry.output) {
                entry.output = true;
              }

              return entry;
            }),
          topics: reference.entries
            .filter(({type}) => type === 'topic-exchange')
            .map(entry => ({
              ...entry,
              routingKey: entry.routingKey.map(route => omit(route, ['summary'])),
            })),
        }),
        {encoding: 'utf-8'}
      );
    }
  },
}];
