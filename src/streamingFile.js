import fs from 'fs';
import path from 'path';
import streamJson from 'stream-json';
import StreamObject from 'stream-json/streamers/StreamObject.js';

const { parser } = streamJson;
const { streamObject } = StreamObject;

const __dirname = path.resolve();

const caminhoArquivo = path.join(__dirname, 'categoriesMLB.json');

const fileStream = fs.createReadStream(caminhoArquivo);

const jsonStream = fileStream
  .pipe(parser())
  .pipe(streamObject()); 

let contador = 0;
console.time('Tempo de processamento');

jsonStream.on('data', ({ key, value }) => {
  // O evento 'data' agora emite um objeto com:
  // 'key': A chave do objeto (ex: "idUnico1", "idUnico2")
  // 'value': O objeto valor correspondente (ex: {"name":"...", "others_attrs":"..."})
  
  // Agora você tem acesso tanto à chave quanto ao valor!
  console.log(`Processando item com a chave: ${key}`);
  // console.log(value); // O objeto completo

  contador++;
});

jsonStream.on('end', () => {
  console.log(`\nLeitura concluída!`);
  console.log(`Total de ${contador} itens processados.`);
  console.timeEnd('Tempo de processamento');
});

jsonStream.on('error', (err) => {
  console.error('Ocorreu um erro no processamento do JSON:', err);
});