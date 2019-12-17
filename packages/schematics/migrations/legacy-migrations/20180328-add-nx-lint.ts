import { updateJsonFile } from '@yolkai/nx-workspace';

export default {
  description: 'Run lint checks ensuring the integrity of the workspace',
  run: () => {
    updateJsonFile('package.json', json => {
      json.scripts = {
        ...json.scripts,
        lint: './node_modules/.bin/nx lint && ng lint'
      };
    });
  }
};
