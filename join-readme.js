const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const outputPath = path.resolve(__dirname, 'output/');
const readMePath = path.resolve(outputPath, 'readme.md');
const extractor = /<include file="(.*)" format="(.*)" \/>/g;

(async () => {
  let readMe = await fs.promises.readFile(readMePath, 'utf8');
  const includes = readMe.matchAll(extractor);
  for await(let include of includes) {
    const fileName = include[1];
    const format = include[2];
    let fileContent = await fs.promises.readFile(path.resolve(outputPath, fileName), 'utf8');
    if (format === 'yaml') {
      try {
        const schema = JSON.parse(fileContent);
        fileContent = YAML.stringify(schema);
      }
      catch(ex) {
        console.error('Enable to parse JSON or convert it to YAML, output as it is.', ex);
      }
    }
    readMe = readMe.replace(include[0], fileContent);
  };
  await fs.promises.writeFile(path.resolve(outputPath, 'readme-hydrated.md'), readMe, { encoding: 'utf8', flag: 'w' });
})();