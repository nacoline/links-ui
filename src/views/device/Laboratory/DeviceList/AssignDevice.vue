<template>
  <j-modal
    :visible="true"
    title="分配设备"
    @cancel="handleCancel"
    @ok="handleOk"
    :confirmLoading="loading"
    width="800px"
  >
    <div class="assign-device-container">
      <pro-search
        :columns="columns"
        target="assign-device"
        @search="handleSearch"
      />
      
      <JProTable
        ref="deviceRef"
        :columns="columns"
        :request="query"
        :defaultParams="{
          sorts: [{ name: 'createTime', order: 'desc' }],
        }"
        :rowSelection="{
          selectedRowKeys: selectedDeviceIds,
          onChange: onSelectChange,
          onSelect: onSelectChange,
          onSelectAll: selectAll,
          onSelectNone: () => (selectedDeviceIds = []),
          preserveSelectedRowKeys: true,
          rowKey: 'id',
        }"
        :params="params"
        :rowKey="(record) => record.id"
      >
        <template #state="slotProps">
          <BadgeStatus
            :status="slotProps.state?.value"
            :text="slotProps.state?.text"
            :statusNames="{
              online: 'processing',
              offline: 'error',
              notActive: 'warning',
            }"
          />
        </template>

        <template #createTime="slotProps">
          <span>{{
            slotProps?.createTime
              ? dayjs(slotProps.createTime).format('YYYY-MM-DD HH:mm:ss')
              : ''
          }}</span>
        </template>
      </JProTable>
    </div>
  </j-modal>
</template>

<script setup lang="ts">
import { LaboratoryAPI } from '@/api/device/laboratory';
import { query as queryDevices } from '@/api/device/instance';
import { onlyMessage } from '@/utils/comm';
import BadgeStatus from '@/components/BadgeStatus/index.vue';
import dayjs from 'dayjs';

interface Props {
  laboratoryId: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'save']);

const deviceRef = ref<Record<string, any>>({});
const selectedDeviceIds = ref<string[]>([]);
const loading = ref(false);
const params = ref<Record<string, any>>({});

// 组件挂载时的调试信息
onMounted(() => {
  console.log('AssignDevice组件挂载，实验室ID:', props.laboratoryId);
  console.log('设备查询API:', queryDevices);
  console.log('实验室API:', LaboratoryAPI);
});

// 查询可分配的设备列表（排除已分配的）
const query = async (params: any) => {
  try {
    console.log('查询设备列表，参数:', params);
    
    // 使用正确的API路径
    const resp = await queryDevices({
      ...params,
      paging: true,
      pageSize: params.pageSize || 10,
      pageIndex: params.current || 1,
    });
    
    console.log('设备查询响应:', resp);
    
    return {
      code: resp.status || 200,
      result: resp.result || [],
      status: resp.status || 200,
      total: resp.total || 0,
    };
  } catch (error) {
    console.error('查询设备列表失败:', error);
    return {
      code: 500,
      result: [],
      status: 500,
      total: 0,
    };
  }
};

// 搜索处理
const handleSearch = (searchParams: any) => {
  params.value = searchParams;
};

// 选择变化
const onSelectChange = (selectedRowKeys: string[], selectedRows: any[]) => {
  selectedDeviceIds.value = selectedRowKeys;
  console.log('选中的设备IDs:', selectedDeviceIds.value);
  console.log('选中的设备行:', selectedRows);
};

// 全选
const selectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
  if (selected) {
    const newIds = changeRows.map((item) => item.id).filter(id => !selectedDeviceIds.value.includes(id));
    selectedDeviceIds.value = [...selectedDeviceIds.value, ...newIds];
  } else {
    const changeIds = changeRows.map((item) => item.id);
    selectedDeviceIds.value = selectedDeviceIds.value.filter(id => !changeIds.includes(id));
  }
  console.log('全选后的设备IDs:', selectedDeviceIds.value);
};

// 取消
const handleCancel = () => {
  selectedDeviceIds.value = [];
  emit('close');
};

// 确定
const handleOk = async () => {
  console.log('确认分配，选中的设备IDs:', selectedDeviceIds.value);
  
  if (!selectedDeviceIds.value.length) {
    onlyMessage('请选择要分配的设备', 'warning');
    return;
  }

  try {
    loading.value = true;
    console.log('调用分配API，实验室ID:', props.laboratoryId, '设备IDs:', selectedDeviceIds.value);
    
    await LaboratoryAPI.assignDevice(props.laboratoryId, selectedDeviceIds.value);
    onlyMessage('分配成功');
    emit('save');
  } catch (error) {
    console.error('分配设备失败:', error);
    onlyMessage('分配失败: ' + (error.message || '未知错误'), 'error');
  } finally {
    loading.value = false;
  }
};

// 表格列配置
const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    search: {
      type: 'string',
      first: true,
    },
  },
  {
    title: '产品名称',
    dataIndex: 'productName',
    key: 'productName',
    ellipsis: true,
    search: {
      type: 'select',
      rename: 'productId',
      options: () =>
        new Promise((resolve) => {
          // 这里需要调用产品列表API
          resolve([]);
        }),
    },
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    scopedSlots: true,
    width: 100,
    search: {
      type: 'select',
      options: [
        { label: '禁用', value: 'notActive' },
        { label: '离线', value: 'offline' },
        { label: '在线', value: 'online' },
      ],
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    scopedSlots: true,
    width: 200,
    search: {
      type: 'date',
    },
  },
];
</script>

<style scoped>
.assign-device-container {
  height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.assign-device-container :deep(.ant-pro-table) {
  flex: 1;
  overflow: auto;
}
</style>
