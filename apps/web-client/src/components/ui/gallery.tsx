'use client'

import { Asset } from "@prisma/client"
import { useState } from "react"
import { Button } from "./button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from 'next/image'

interface GalleryProps {
  images: Asset[]
}

const Gallery = ({images}: GalleryProps) => {
  const [index, setIndex] = useState(0);

  const onNavigate = (dir: 1 | -1) => () => {
    setIndex(prev => (prev + dir) < images.length && (prev + dir) >= 0 ? prev + dir : prev)
  }

  return (
    <div className="h-[400px] block relative bg-cover rounded-sm shadow-lg" style={{backgroundImage: `url(${images[index].smallUrl})`}}>
      <div className="w-full absolute justify-between px-2 h-full flex items-center top-0">
        <Button size={'icon'} variant={'outline'} onClick={onNavigate(-1)}>
          <ArrowLeft />
        </Button>
        <Button size={'icon'} variant={'outline'} onClick={onNavigate(1)}>
          <ArrowRight />
        </Button>
      </div>
      <Image alt="" blurDataURL={images[index].smallUrl} width={images[index].width} height={images[index].height} src={images[index].url} className="w-full block h-full object-contain" />
    </div>
  )
}

export default Gallery
