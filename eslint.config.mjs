import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  ignores: [
    'node_modules',
    'dist',
    'workers',
    'vsp-marp',
    'sourcemd',
    '.pipeline',
    '.plan-state',
    '.claude',
    'skills/vsp-marp',
    'skills/vsp-marp-audit',
    '*.skill',
  ],
})
