<template>
  <div class="relative">
    <!-- 搜索框 -->
    <div class="mb-2">
      <div class="flex gap-2 relative">
        <input
          v-model="searchKeyword"
          type="text"
          class="flex-grow px-4 py-2 border rounded-md"
          placeholder="输入地点名称"
          @keyup.enter.prevent="searchPlace"
        />
        <button type="button" class="bg-blue-600 text-white px-4 rounded" @click="searchPlace">搜索</button>

        <!-- 绝对定位搜索结果列表 -->
        <ul
          v-if="searchResults.length"
          class="absolute left-0 right-0 bg-white border rounded mt-1 max-h-48 overflow-y-auto z-10 shadow-md"
          style="top: 100%;"
        >
          <li
            v-for="(item, index) in searchResults"
            :key="index"
            class="p-2 cursor-pointer hover:bg-blue-100"
            @click="selectSearchResult(item)"
          >
            {{ item.name }} — {{ item.address }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="container" class="w-full h-64 border rounded"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { useToast } from '../composables/useToast'

// ✅ 修复 TS 报错：声明 window._AMapSecurityConfig 类型
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

const emit = defineEmits<{
  (e: 'update', data: { lng: number; lat: number; address: string }): void
}>()

const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const map = ref<any>(null)
const marker = ref<any>(null)

const { show } = useToast()

onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: '高德地图JS SDK安全密钥！（自定义）',
  }

  AMapLoader.load({
    key: '高德地图JS SDK秘钥！（自定义）',
    version: '2.0',
    plugins: ['AMap.Geocoder', 'AMap.PlaceSearch'],
  })
    .then((AMap) => {
      map.value = new AMap.Map('container', {
        viewMode: '2D',
        zoom: 15,
        center: [105.446113, 28.883955],
      })

      marker.value = new AMap.Marker({ map: map.value })

      map.value.on('click', (e: any) => {
        const lnglat = e.lnglat
        marker.value.setPosition(lnglat)

        const geocoder = new AMap.Geocoder({ radius: 1000, extensions: 'all' })
        geocoder.getAddress(lnglat, (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            const addr = result.regeocode.formattedAddress
            emit('update', {
              lng: lnglat.lng,
              lat: lnglat.lat,
              address: addr,
            })
          }
        })
      })
    })
    .catch((e) => {
      console.error('AMap 加载失败', e)
    })
})

onUnmounted(() => {
  map.value?.destroy()
})

function searchPlace() {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  const placeSearch = new AMap.PlaceSearch({
    pageSize: 10,
    city: '',
    citylimit: false,
  })

  placeSearch.search(searchKeyword.value.trim(), (status: string, result: any) => {
    if (status === 'complete' && result.poiList) {
      searchResults.value = result.poiList.pois.map((poi: any) => ({
        name: poi.name,
        address: poi.address,
        location: poi.location,
      }))
    } else {
      searchResults.value = []
      show('未找到匹配地点', 'info')
    }
  })
}

function selectSearchResult(item: any) {
  if (!map.value) return
  map.value.setZoomAndCenter(17, item.location)
  marker.value.setPosition(item.location)

  emit('update', {
    lng: item.location.lng,
    lat: item.location.lat,
    address: item.name,
  })

  searchKeyword.value = item.name
  searchResults.value = []
}
</script>

<style scoped>
#container {
  width: 100%;
  height: 16rem; /* h-64 */
}
ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}
</style>
