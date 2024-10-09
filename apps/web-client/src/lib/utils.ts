import { clsx, type ClassValue } from "clsx"
import { UseFormReturn } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setFieldErrors(form: UseFormReturn<any, any, any>, errors: z.typeToFlattenedError<any, string>) {
  Object.entries(errors.fieldErrors).forEach(([key, value], i) => {
    if(i=== 0) {
      console.log('here')
      form.setFocus(key)
    }
    form.setError(key, {type: 'manual', message: value?.[0]})
  })
}
