import { updatePackagesInPackageJson } from '@yolkai/nx-workspace';

import { join } from 'path';

export default () => {
  return updatePackagesInPackageJson(
    join(__dirname, '../../../migrations.json'),
    '9.0.0'
  );
};
