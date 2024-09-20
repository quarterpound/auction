import { Hono } from "hono";
import { fileParser } from "./validator";
import { uploadFile } from "../../files";
import { prisma } from "../../database";

export const uploadRouter = new Hono().basePath('/uploads')

uploadRouter.post('/', async (c) => {
  const parsedBody = await c.req.parseBody()
  const fileField = parsedBody['file']

  const uploadedFile = fileParser.parse(fileField)

  const uploaded = await uploadFile(Buffer.from(await uploadedFile.arrayBuffer()))

  const asset = await prisma.asset.create({
    data: {
      url: uploaded.secure_url,
      width: uploaded.width,
      height: uploaded.height
    }
  })

  return c.json(asset)
})
