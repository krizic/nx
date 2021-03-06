import { Tree } from '@angular-devkit/schematics';
import {
  _test_addWorkspaceFile,
  WorkspaceFormat
} from '@angular-devkit/core/src/workspace/core';
import { NxJson } from '@yolkai/nx-workspace/src/core/shared-interfaces';
import { Architect, BuilderContext, Target } from '@angular-devkit/architect';
import {
  TestingArchitectHost,
  TestLogger
} from '@angular-devkit/architect/testing';
import { JsonObject } from '@angular-devkit/core';
import { ScheduleOptions } from '@angular-devkit/architect/src/api';

export function getFileContent(tree: Tree, path: string): string {
  const fileEntry = tree.get(path);

  if (!fileEntry) {
    throw new Error(`The file (${path}) does not exist.`);
  }

  return fileEntry.content.toString();
}

export function createEmptyWorkspace(tree: Tree): Tree {
  _test_addWorkspaceFile('workspace.json', WorkspaceFormat.JSON);

  tree.create(
    '/workspace.json',
    JSON.stringify({ version: 1, projects: {}, newProjectRoot: '' })
  );
  tree.create(
    '/package.json',
    JSON.stringify({
      name: 'test-name',
      dependencies: {},
      devDependencies: {}
    })
  );
  tree.create(
    '/nx.json',
    JSON.stringify(<NxJson>{ npmScope: 'proj', projects: {} })
  );
  tree.create(
    '/tsconfig.json',
    JSON.stringify({ compilerOptions: { paths: {} } })
  );
  tree.create(
    '/tslint.json',
    JSON.stringify({
      rules: {
        'nx-enforce-module-boundaries': [
          true,
          {
            npmScope: '<%= npmScope %>',
            lazyLoad: [],
            allow: []
          }
        ]
      }
    })
  );
  return tree;
}

/**
 * Mock context which makes testing builders easier
 */
export class MockBuilderContext implements BuilderContext {
  id: 0;

  builder: any = {};
  analytics = null;

  target: Target = {
    project: null,
    target: null
  };

  logger = new TestLogger('test');

  get currentDirectory() {
    return this.architectHost.currentDirectory;
  }
  get workspaceRoot() {
    return this.architectHost.workspaceRoot;
  }
  constructor(
    private architect: Architect,
    private architectHost: TestingArchitectHost
  ) {}

  async addBuilderFromPackage(path: string) {
    return await this.architectHost.addBuilderFromPackage(path);
  }

  async addTarget(target: Target, builderName: string) {
    return this.architectHost.addTarget(target, builderName);
  }

  getBuilderNameForTarget(target: Target) {
    return this.architectHost.getBuilderNameForTarget(target);
  }

  scheduleTarget(
    target: Target,
    overrides?: JsonObject,
    scheduleOptions?: ScheduleOptions
  ) {
    return this.architect.scheduleTarget(target, overrides, scheduleOptions);
  }

  scheduleBuilder(
    name: string,
    overrides?: JsonObject,
    scheduleOptions?: ScheduleOptions
  ) {
    return this.architect.scheduleBuilder(name, overrides, scheduleOptions);
  }

  getTargetOptions(target: Target) {
    return this.architectHost.getOptionsForTarget(target);
  }

  validateOptions<T extends JsonObject = JsonObject>(
    options: JsonObject,
    builderName: string
  ): Promise<T> {
    return Promise.resolve<T>(options as T);
  }

  reportRunning() {}

  reportStatus(status: string) {}

  reportProgress(current: number, total?: number, status?: string) {}

  addTeardown(teardown: () => Promise<void> | void) {}
}
