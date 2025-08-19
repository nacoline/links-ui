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
          onSelectAll: selectAll,
          onSelectNone: () => (selectedDeviceIds.value = []),
          preserveSelectedRowKeys: true,
          getCheckboxProps: (record: any) => ({ disabled: record.disabled === true })
        }"
        :params="params"
        rowKey="id"
        model="TABLE"
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

// 已分配设备ID缓存
const assignedIds = ref<string[]>([]);

// 初始化已分配设备列表
const loadAssigned = async () => {
  try {
    const resp = await LaboratoryAPI.devices(props.laboratoryId, { paging: false });
    assignedIds.value = (resp?.result || []).map((m: any) => m.deviceId).filter(Boolean);
  } catch (e) {
    assignedIds.value = [];
  }
};

onMounted(async () => {
  await loadAssigned();
});

// 查询可分配的设备列表（排除已分配的）
const query = async (params: any) => {
  try {
    const pageSize = params.pageSize || 10;
    const pageIndex = params.current || 1;

    // 基础 terms
    const terms: any[] = [];
    if (assignedIds.value.length) {
      // 使用 not-in 语法，直接生成 NOT IN 条件
      terms.push({
        column: 'id$not-in',
        value: assignedIds.value,
      });
    }

    const resp = await queryDevices({
      ...params,
      terms: [...(params?.terms || []), ...terms],
      paging: true,
      pageSize,
      pageIndex,
    });

    const data = Array.isArray(resp?.result?.data) ? resp.result.data : (resp?.result || []);
    const total = typeof resp?.result?.total === 'number' ? resp.result.total : (resp?.total || 0);

    // 标记禁用：已分配的设备禁用选择
    const resultData = data.map((item: any) => ({
      ...item,
      disabled: assignedIds.value.includes(item.id),
    }));

    return {
      code: resp.status || 200,
      status: resp.status || 200,
      result: {
        data: resultData,
        pageIndex: pageIndex - 1,
        pageSize,
        total,
      },
    };
  } catch (error) {
    console.error('查询设备列表失败:', error);
    return {
      code: 500,
      status: 500,
      result: {
        data: [],
        pageIndex: 0,
        pageSize: params?.pageSize || 10,
        total: 0,
      },
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
