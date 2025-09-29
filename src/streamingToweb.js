import { Readable, Transform } from 'node:stream'

import fs from 'fs';
import path from 'path';

import streamJson from 'stream-json';
import StreamObject from 'stream-json/streamers/StreamObject.js';

const { parser } = streamJson;
const { streamObject } = StreamObject;

const __dirname = path.resolve();
const pathFile = path.join(__dirname, 'categoriesMLB.json');


const getStreamedCategories = () => {
  const fileStream = fs.createReadStream(pathFile);
  const ReadableToWeb = Readable.toWeb(fileStream)
    .pipeThrough(Transform.toWeb(parser()))
    .pipeThrough(Transform.toWeb(streamObject()))
    .pipeThrough(new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(JSON.stringify(chunk).concat('\n'));
      }
    }));

  return ReadableToWeb;

}

export { getStreamedCategories };