import { workspaceFileName } from './file-utils';
import { ImplicitJsonSubsetDependency } from '@yolkai/nx-workspace/src/core/shared-interfaces';

export function assertWorkspaceValidity(workspaceJson, nxJson) {
  const workspaceJsonProjects = Object.keys(workspaceJson.projects);
  const nxJsonProjects = Object.keys(nxJson.projects);

  if (minus(workspaceJsonProjects, nxJsonProjects).length > 0) {
    throw new Error(
      `${workspaceFileName()} and nx.json are out of sync. The following projects are missing in nx.json: ${minus(
        workspaceJsonProjects,
        nxJsonProjects
      ).join(', ')}`
    );
  }

  if (minus(nxJsonProjects, workspaceJsonProjects).length > 0) {
    throw new Error(
      `${workspaceFileName()} and nx.json are out of sync. The following projects are missing in ${workspaceFileName()}: ${minus(
        nxJsonProjects,
        workspaceJsonProjects
      ).join(', ')}`
    );
  }

  const projects = {
    ...workspaceJson.projects,
    ...nxJson.projects
  };

  const invalidImplicitDependencies = new Map<string, string[]>();

  Object.entries<'*' | string[] | ImplicitJsonSubsetDependency>(
    nxJson.implicitDependencies || {}
  )
    .reduce((acc, entry) => {
      function recur(value, acc = []) {
        if (value === '*') {
          // do nothing since '*' is calculated and always valid.
        } else if (Array.isArray(value)) {
          acc.push([entry[0], value]);
        } else {
          Object.values(value).forEach(v => {
            recur(v, acc);
          });
        }
      }
      recur(entry[1], acc);
      return acc;
    }, [])
    .reduce((map, [filename, projectNames]: [string, string[]]) => {
      detectAndSetInvalidProjectValues(map, filename, projectNames, projects);
      return map;
    }, invalidImplicitDependencies);

  nxJsonProjects
    .filter(nxJsonProjectName => {
      const project = nxJson.projects[nxJsonProjectName];
      return !!project.implicitDependencies;
    })
    .reduce((map, nxJsonProjectName) => {
      const project = nxJson.projects[nxJsonProjectName];
      detectAndSetInvalidProjectValues(
        map,
        nxJsonProjectName,
        project.implicitDependencies,
        projects
      );
      return map;
    }, invalidImplicitDependencies);

  if (invalidImplicitDependencies.size === 0) {
    return;
  }

  let message = `The following implicitDependencies specified in nx.json are invalid:
  `;
  invalidImplicitDependencies.forEach((projectNames, key) => {
    const str = `  ${key}
    ${projectNames.map(projectName => `    ${projectName}`).join('\n')}`;
    message += str;
  });

  throw new Error(message);
}

function detectAndSetInvalidProjectValues(
  map: Map<string, string[]>,
  sourceName: string,
  desiredProjectNames: string[],
  validProjects: any
) {
  const invalidProjects = desiredProjectNames.filter(
    projectName => !validProjects[projectName]
  );
  if (invalidProjects.length > 0) {
    map.set(sourceName, invalidProjects);
  }
}

function minus(a: string[], b: string[]): string[] {
  const res = [];
  a.forEach(aa => {
    if (!b.find(bb => bb === aa)) {
      res.push(aa);
    }
  });
  return res;
}
