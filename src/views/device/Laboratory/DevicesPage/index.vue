<template>
  <page-container>
    <template #header>
      <j-space>
        <j-button type="default" @click="goBack">
          <template #icon>
            <AIcon type="ArrowLeftOutlined" />
          </template>
          返回
        </j-button>
        <span style="font-weight: 600; margin-left: 8px">{{ labName || '实验室' }} - 设备</span>
        <j-button @click="onRefresh">
          <template #icon>
            <AIcon type="ReloadOutlined" />
          </template>
          刷新
        </j-button>
      </j-space>
    </template>

    <FullPage>
      <JProTable
        ref="deviceRef"
        :columns="columns"
        :request="query"
        :defaultParams="{
          sorts: [{ name: 'createTime', order: 'desc' }],
        }"
        rowKey="id"
        model="TABLE"
      >
        <template #card="item">
          <div class="device-card" @click="toDetail(item.id)" :title="item.name">
            <div class="device-card-title">{{ item.name }}</div>
            <div class="device-card-sub">{{ item.productName }}</div>
            <div class="device-card-state">
              <BadgeStatus :status="item.state?.value" :text="item.state?.text" />
            </div>
          </div>
        </template>

        <template #state="slotProps">
          <BadgeStatus
            :status="slotProps.state?.value"
            :text="slotProps.state?.text"
            :statusNames="{ online: 'processing', offline: 'error', notActive: 'warning' }"
          />
        </template>

        <template #createTime="slotProps">
          <span>{{ slotProps?.createTime ? dayjs(slotProps.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
        </template>

        <template #name="slotProps">
          <j-button type="link" @click="toDetail(slotProps.id)">{{ slotProps.name }}</j-button>
        </template>
      </JProTable>
    </FullPage>
  </page-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { LaboratoryAPI } from '@/api/device/laboratory'
import { queryDeviceList } from '@/api/edge/resource'
import BadgeStatus from '@/components/BadgeStatus/index.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const deviceRef = ref<Record<string, any>>({})

const labId = computed(() => String(route.params.id || ''))
const labName = computed(() => String(route.query.name || ''))

const onRefresh = () => deviceRef.value?.reload()
const goBack = () => router.back()

const toDetail = (deviceId: string) => {
  // 跳转到设备详情
  router.push(`/iot/device/Instance/detail/${deviceId}`)
}

// 请求设备数据：先取关联，再按ID查询详情
const query = async (params: any) => {
  try {
    const mappingResp = await LaboratoryAPI.devices(labId.value, { paging: false })
    const idList = (mappingResp?.result || []).map((m: any) => m.deviceId).filter(Boolean)
    if (!idList.length) {
      return { code: 200, status: 200, result: { data: [], pageIndex: 0, pageSize: params?.pageSize || 12, total: 0 } }
    }

    const pageSize = params?.pageSize || 12
    const pageIndex = params?.current || 1

    const resp = await queryDeviceList({
      pageSize,
      pageIndex,
      terms: [ { column: 'id', termType: 'in', value: idList } ],
      sorts: params?.sorts || [{ name: 'createTime', order: 'desc' }],
    })

    const data = Array.isArray(resp?.result?.data) ? resp.result.data : (resp?.result || [])
    const total = typeof resp?.result?.total === 'number' ? resp.result.total : (resp?.total || 0)

    return {
      code: resp?.status || 200,
      status: resp?.status || 200,
      result: { data, pageIndex: pageIndex - 1, pageSize, total },
    }
  } catch (error) {
    console.error('查询实验室设备失败:', error)
    return { code: 500, status: 500, result: { data: [], pageIndex: 0, pageSize: params?.pageSize || 12, total: 0 } }
  }
}

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name', scopedSlots: true, ellipsis: true },
  { title: '产品名称', dataIndex: 'productName', key: 'productName', ellipsis: true },
  { title: '状态', dataIndex: 'state', key: 'state', scopedSlots: true, width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', scopedSlots: true, width: 200 },
]
</script>

<style scoped>
.device-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all .2s ease;
}
.device-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.device-card-title { font-weight: 600; margin-bottom: 4px; }
.device-card-sub { color: #888; font-size: 12px; margin-bottom: 8px; }
</style>
