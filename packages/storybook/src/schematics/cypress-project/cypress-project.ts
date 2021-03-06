import {
  chain,
  externalSchematic,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import { getProjectConfig, updateWorkspaceInTree } from '@yolkai/nx-workspace';
import { parseJsonAtPath, safeFileDelete } from '../../utils/utils';

export interface CypressConfigureSchema {
  name: string;
  js?: boolean;
}

export default function(schema: CypressConfigureSchema): Rule {
  const e2eProjectName = schema.name + '-e2e';
  return chain([
    externalSchematic('@yolkai/nx-cypress', 'cypress-project', {
      name: e2eProjectName,
      project: schema.name,
      js: schema.js
    }),
    removeUnneededFiles(e2eProjectName, schema.js),
    addBaseUrlToCypressConfig(e2eProjectName),
    updateAngularJsonBuilder(e2eProjectName, schema.name)
  ]);
}

function removeUnneededFiles(projectName: string, js: boolean): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    safeFileDelete(
      tree,
      getProjectConfig(tree, projectName).sourceRoot +
        (js ? '/integration/app.spec.js' : '/integration/app.spec.ts')
    );
    safeFileDelete(
      tree,
      getProjectConfig(tree, projectName).sourceRoot +
        (js ? '/support/app.po.js' : '/support/app.po.ts')
    );

    return tree;
  };
}

function addBaseUrlToCypressConfig(projectName: string): Rule {
  return (tree: Tree, context: SchematicContext): void | Tree => {
    const cypressConfigPath =
      getProjectConfig(tree, projectName).root + '/cypress.json';
    const cypressConfig = parseJsonAtPath(tree, cypressConfigPath);

    let cypressConfigContent: any;

    if (cypressConfig && cypressConfig.value) {
      cypressConfigContent = cypressConfig.value;
    } else {
      return tree;
    }

    cypressConfigContent.baseUrl = 'http://localhost:4400';

    return tree.overwrite(
      cypressConfigPath,
      JSON.stringify(cypressConfigContent, null, 2) + '\n'
    );
  };
}

function updateAngularJsonBuilder(
  e2eProjectName: string,
  targetProjectName
): Rule {
  return updateWorkspaceInTree(workspace => {
    const project = workspace.projects[e2eProjectName];
    const e2eTarget = project.architect['e2e'];
    project.architect['e2e'] = {
      ...e2eTarget,
      options: <any>{
        ...e2eTarget.options,
        devServerTarget: `${targetProjectName}:storybook`
      }
    };
    return workspace;
  });
}
