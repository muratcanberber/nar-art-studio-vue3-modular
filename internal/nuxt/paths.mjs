import { joinRelativeURL } from 'ufo'
import { useRuntimeConfig } from '#internal/nitro'

export function baseURL() {
  return useRuntimeConfig().app.baseURL
}

export function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir
}

export function buildAssetsURL(...segments) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...segments)
}

export function publicAssetsURL(...segments) {
  const app = useRuntimeConfig().app
  const publicBase = app.cdnURL || app.baseURL
  return segments.length ? joinRelativeURL(publicBase, ...segments) : publicBase
}
