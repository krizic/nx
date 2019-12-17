import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';
import { runSchematic } from '../../utils/testing';
import { readJsonInTree } from '@yolkai/nx-workspace';

describe('app', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should generate files', async () => {
    const tree = await runSchematic('app', { name: 'myNodeApp' }, appTree);
    expect(tree.readContent('apps/my-node-app/src/main.ts')).toContain(
      `import * as express from 'express';`
    );
  });

  it('should update tsconfig', async () => {
    const tree = await runSchematic('app', { name: 'myNodeApp' }, appTree);
    const tsconfig = readJsonInTree(tree, 'apps/my-node-app/tsconfig.json');
    expect(tsconfig.extends).toEqual('../../tsconfig.json');
    expect(tsconfig.compilerOptions.types).toContain('express');
  });
});
