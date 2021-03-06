import { JsonObject } from '@angular-devkit/core';
import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  addPackageWithInit,
  updateWorkspace
} from '@yolkai/nx-workspace';
import {
  nextVersion,
  zeitNextCss,
  zeitNextLess,
  zeitNextSass,
  zeitNextStylus
} from '../../utils/versions';
import { Schema } from './schema';

export function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      next: nextVersion,
      '@zeit/next-css': zeitNextCss,
      '@zeit/next-sass': zeitNextLess,
      '@zeit/next-less': zeitNextSass,
      '@zeit/next-stylus': zeitNextStylus
    },
    {}
  );
}

function setDefault(): Rule {
  return updateWorkspace(workspace => {
    // Set workspace default collection to 'react' if not already set.
    workspace.extensions.cli = workspace.extensions.cli || {};
    const defaultCollection: string =
      workspace.extensions.cli &&
      ((workspace.extensions.cli as JsonObject).defaultCollection as string);

    if (!defaultCollection || defaultCollection === '@yolkai/nx-workspace') {
      (workspace.extensions.cli as JsonObject).defaultCollection =
        '@yolkai/nx-next';
    }
  });
}

export default function(schema: Schema) {
  return chain([
    setDefault(),
    addPackageWithInit('@yolkai/nx-jest'),
    addPackageWithInit('@yolkai/nx-cypress'),
    addPackageWithInit('@yolkai/nx-web'),
    addPackageWithInit('@yolkai/nx-react'),
    addDependencies()
  ]);
}
