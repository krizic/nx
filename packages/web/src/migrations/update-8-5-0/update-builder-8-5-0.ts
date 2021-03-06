import { Rule } from '@angular-devkit/schematics';
import { updateWorkspaceInTree } from '@yolkai/nx-workspace';

export default function update(): Rule {
  return updateWorkspaceInTree(config => {
    const filteredProjects = [];
    Object.keys(config.projects).forEach(name => {
      if (
        config.projects[name].architect &&
        config.projects[name].architect.build &&
        config.projects[name].architect.build.builder === '@yolkai/nx-web:build'
      ) {
        filteredProjects.push(config.projects[name]);
      }
    });
    filteredProjects.forEach(p => {
      delete p.architect.build.options.differentialLoading;
    });
    return config;
  });
}
