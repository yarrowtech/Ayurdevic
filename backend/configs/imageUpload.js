import express from "express";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

export const uploadDirectory = fileURLToPath(new URL("../uploads/", import.meta.url));

export function imageExtension(bytes) {
  if (!Buffer.isBuffer(bytes)) return null;
  if (bytes.length >= 3 && bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "jpg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "gif";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export const imageUpload = [
  express.raw({ type: ["image/jpeg", "image/png", "image/gif", "image/webp"], limit: "5mb" }),
  async (req, res) => {
    const extension = imageExtension(req.body);
    if (!extension) return res.status(400).json({ success: false, message: "Choose a JPEG, PNG, GIF, or WebP image." });
    try {
      await mkdir(uploadDirectory, { recursive: true });
      const filename = `${randomUUID()}.${extension}`;
      await writeFile(new URL(`../uploads/${filename}`, import.meta.url), req.body, { flag: "wx" });
      res.status(201).json({ success: true, path: `/uploads/${filename}` });
    } catch {
      res.status(500).json({ success: false, message: "Unable to upload image. Please try again." });
    }
  },
  (error, req, res, next) => {
    if (error.type === "entity.too.large") return res.status(413).json({ success: false, message: "Each image must be 5 MB or smaller." });
    next(error);
  },
];
