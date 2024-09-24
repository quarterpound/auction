import { Hono } from "hono";
import { fileParser } from "./validator";
import { uploadFile } from "../../files";
import { prisma } from "../../database";

export const uploadRouter = new Hono().basePath('/uploads')

uploadRouter.post('/', async (c) => {
  const parsedBody = await c.req.parseBody()
  const fileField = parsedBody['file']

  const uploadedFile = fileParser.parse(fileField)

  const [hq, thumb] = await uploadFile(Buffer.from(await uploadedFile.arrayBuffer()))

  const asset = await prisma.asset.create({
    data: {
      name: uploadFile.name,
      url: hq.secure_url,
      width: hq.width,
      height: hq.height,
      smallUrl: thumb.secure_url,
      smallWidth: thumb.width,
      smallHeight: thumb.height
    }
  })

  return c.json(asset)
})
