const fs = require('fs');
const path = require('path');

const readMePath = path.resolve(__dirname, 'readme.md');
const outputPath = path.resolve(__dirname, 'output/');
const newSection = '\n### ';
const extractor = /<td valign="top">\s*`{3}json\s*(.*)`{3}\s*<\/td>\s*<td valign="top">\s*`{3}yaml\s*(.*)`{3}/s;
const kebabCase = (source) => {
  if (!source) return '';
  return source
    .replace(/([A-Z])/g, '-$1')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
};

(async () => {  
  try {
    await fs.promises.mkdir(outputPath);
  }
  catch {}
  let readMe = await fs.promises.readFile(readMePath, 'utf8');
  const blocks = readMe.split(newSection);
  readMe = '';
  let isFirst = true;
  for await (let block of blocks) {
    const title = block.split('\n')[0];
    const examples = block.match(extractor);
    if (examples) {
      const fileName = kebabCase(title.toLowerCase().replace('example', '').trim());
      await fs.promises.writeFile(path.resolve(outputPath, fileName + '.json'), examples[1], { encoding: 'utf8', flag: 'w' });
      await fs.promises.writeFile(path.resolve(outputPath, fileName + '.yml'), examples[2], { encoding: 'utf8', flag: 'w' });
      block = block.replace(examples[1], `<include file="${fileName}.json" />`);
      block = block.replace(examples[2], `<include file="${fileName}.yml" />`);
    }
    readMe += isFirst ? block : `${newSection}${block}`;
    isFirst = false;
  };
  await fs.promises.writeFile(path.resolve(outputPath, 'readme.md'), readMe, { encoding: 'utf8', flag: 'w' });
})();