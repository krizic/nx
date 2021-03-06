import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { getWorkspace } from '@yolkai/nx-workspace';
import { appRootPath } from '@yolkai/nx-workspace/src/utils/app-root';
import * as path from 'path';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Schema } from '../schema';
import { getDestination } from './utils';

/**
 * Updates the files in the root of the project
 *
 * Typically these are config files which point outside of the project folder
 *
 * @param schema The options provided to the schematic
 */
export function updateProjectRootFiles(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    return from(getWorkspace(tree)).pipe(
      map(workspace => {
        const project = workspace.projects.get(schema.projectName);
        const destination = getDestination(schema, workspace);

        const newRelativeRoot = path.relative(
          path.join(appRootPath, destination),
          appRootPath
        );
        const oldRelativeRoot = path.relative(
          path.join(appRootPath, project.root),
          appRootPath
        );

        if (newRelativeRoot === oldRelativeRoot) {
          // nothing to do
          return tree;
        }

        const dots = /\./g;
        const regex = new RegExp(oldRelativeRoot.replace(dots, '\\.'), 'g');

        const isRootFile = new RegExp(`${schema.destination}/[^/]+.js*`);
        const projectDir = tree.getDir(destination);
        projectDir.visit(file => {
          if (!isRootFile.test(file)) {
            return;
          }

          const oldContent = tree.read(file).toString();
          const newContent = oldContent.replace(regex, newRelativeRoot);
          tree.overwrite(file, newContent);
        });

        return tree;
      })
    );
  };
}
