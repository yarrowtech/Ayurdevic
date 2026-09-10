import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { unlink, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { imageUpload, uploadDirectory } from "./imageUpload.js";

test("image uploads persist valid images and reject unsupported or oversized files", async () => {
  const app = express();
  app.post("/images", ...imageUpload);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/images`;
  let savedPath;
  try {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9z8AAAAASUVORK5CYII=", "base64");
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "image/png" }, body: png });
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.match(result.path, /^\/uploads\/[a-f0-9-]+\.png$/);
    savedPath = join(uploadDirectory, basename(result.path));
    assert.deepEqual(await readFile(savedPath), png);
    const invalid = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "image/png" }, body: "not an image" });
    assert.equal(invalid.status, 400);
    const svg = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "image/svg+xml" }, body: "<svg/>" });
    assert.equal(svg.status, 400);
    const oversized = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "image/png" }, body: Buffer.alloc(5 * 1024 * 1024 + 1) });
    assert.equal(oversized.status, 413);
  } finally {
    if (savedPath) await unlink(savedPath);
    await new Promise(resolve => server.close(resolve));
  }
});
