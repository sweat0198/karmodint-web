import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'Karmod International Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'dummy_project_id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure
    })
  ],

  schema: {
    types: schemaTypes
  }
})

