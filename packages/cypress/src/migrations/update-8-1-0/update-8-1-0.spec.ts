import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { serializeJson } from '@yolkai/nx-workspace';

import * as path from 'path';

describe('Update 8.1.0', () => {
  let initialTree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(
      'package.json',
      serializeJson({
        scripts: {}
      })
    );
    schematicRunner = new SchematicTestRunner(
      '@yolkai/nx-cypress',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  it('should update cypress', async () => {
    const result = await schematicRunner
      .runSchematicAsync('update-8.1.0', {}, initialTree)
      .toPromise();

    const { devDependencies } = JSON.parse(result.readContent('package.json'));

    expect(devDependencies.cypress).toEqual('~3.3.1');
  });
});
