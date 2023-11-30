const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(__dirname, 'output/');
const readMePath = path.resolve(outputPath, 'readme.md');
const newSection = '\n### ';
const extractor = /<include file="(.*)" \/>/g;

(async () => {
  let readMe = await fs.promises.readFile(readMePath, 'utf8');
  const includes = readMe.matchAll(extractor);
  for await(let include of includes) {
    const fileName = include[1];
    const fileContent = await fs.promises.readFile(path.resolve(outputPath, fileName), 'utf8');
    readMe = readMe.replace(include[0], fileContent);
  };
  await fs.promises.writeFile(path.resolve(outputPath, 'readme-hydrated.md'), readMe, { encoding: 'utf8', flag: 'w' });
})();