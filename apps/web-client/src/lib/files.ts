import { Asset } from "@prisma/client"

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res =  await fetch('http://localhost:4200/uploads', {
    method: 'post',
    body: formData
  })

  if(!res.ok) {
    throw new Error("file failed to upload")
  }

  return res.json() as Promise<Asset>
}
