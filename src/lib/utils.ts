import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import xss from "xss";
import { nanoid } from "nanoid";

export function generateId(size: number = 21): string {
  return nanoid(size);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeText(dirty: string): string {
  return xss(dirty, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
  });
}