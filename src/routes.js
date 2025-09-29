import Fastify from "fastify";
import cors from '@fastify/cors'
import fs from "fs";
import path from "path";
import { WritableStream } from 'node:stream/web'
import { getStreamedCategories } from "./streamingToweb.js";

const __dirname = path.resolve();
const pathFile = path.join(__dirname, 'categoriesMLB.json');

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

fastify.get("/", function (request, reply) {
  const fileStream = fs.createReadStream(pathFile);

  reply.header('Content-Type', 'application/x-ndjson');
  const stream = getStreamedCategories();
  stream.pipeTo(new WritableStream({
    write(chunk) {
      reply.raw.write(chunk);
    },
    close() {
      if (!reply.raw.writableEnded) {
        reply.raw.end();
      }
    }
  }));


  fileStream.on("error", (err) => {
    console.error("Ocorreu um erro no processamento do JSON:", err);
    fastify.log.error('Error to stream file', err);
    reply.raw.end();
  });
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
