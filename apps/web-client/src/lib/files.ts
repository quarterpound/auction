import { Asset } from "@prisma/client"

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res =  await fetch(`${process.env.NEXT_PUBLIC_TRPC_URL ?? 'https://api.auksiyon.az'}/uploads`, {
    method: 'post',
    body: formData
  })

  if(!res.ok) {
    throw new Error("file failed to upload")
  }

  return res.json() as Promise<Asset>
}
