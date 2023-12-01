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
const knownExamples = [];

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
      const json = examples[1];
      try {
        const workflow = JSON.parse(json);
        const fileName = workflow.id.toLowerCase();
        const prettyFileName = kebabCase(title.toLowerCase().replace('example', '').trim());
        if (knownExamples.includes(fileName)) {
          const count = knownExamples.filter(example => example.startsWith(fileName)).length;
          fileName += `-${count}`;
        }
        await fs.promises.rename(path.resolve(outputPath, fileName + '.json'), path.resolve(outputPath, prettyFileName + '.json'));
      }
      catch (ex) 
      {
        console.error('Failed to parse JSON ', json);
        console.error(ex);
      }
    }
    readMe += isFirst ? block : `${newSection}${block}`;
    isFirst = false;
  };
  await fs.promises.writeFile(path.resolve(outputPath, 'readme.md'), readMe, { encoding: 'utf8', flag: 'w' });
})();