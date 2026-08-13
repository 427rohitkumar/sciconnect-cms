import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  canCreateMedia,
  canDeleteMedia,
  canReadMedia,
  canUpdateMedia,
} from '../access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    create: canCreateMedia,
    read: canReadMedia,
    update: canUpdateMedia,
    delete: canDeleteMedia,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
    },
  ],
}
