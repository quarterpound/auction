import { z } from "zod";

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 10; // 3MB
export const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/heic'];

export const fileParser = z.instanceof(File).refine(file => file.size <= MAX_UPLOAD_SIZE, 'File size too big').refine(file => ACCEPTED_FILE_TYPES.includes(file.type))
