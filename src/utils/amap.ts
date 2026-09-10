import AMapLoader from '@amap/amap-jsapi-loader'

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

export function loadAMap() {
  window._AMapSecurityConfig = {
    securityJsCode: '47ef8b2d0201c661483fab831d5bd98d',
  }

  return AMapLoader.load({
    key: '2f2cb6ee6731c0cec27962504a6cf3f8',
    version: '2.0',
    plugins: ['AMap.Geocoder', 'AMap.PlaceSearch'],
  })
}
