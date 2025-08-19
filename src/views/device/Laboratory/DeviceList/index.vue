<template>
  <j-modal
    :visible="true"
    :title="`${laboratory.name} - 设备管理`"
    @cancel="handleCancel"
    width="1000px"
    :footer="null"
  >
    <div class="device-list-container">
      <div class="device-list-header">
        <j-space>
          <j-button
            type="primary"
            @click="handleAssignDevice"
          >
            <template #icon>
              <AIcon type="PlusOutlined" />
            </template>
            分配设备
          </j-button>
          <j-button
            @click="handleRemoveDevice"
            :disabled="!selectedDeviceIds.length"
          >
            <template #icon>
              <AIcon type="DeleteOutlined" />
            </template>
            移除设备
          </j-button>
          <j-button @click="onRefresh">
            <template #icon>
              <AIcon type="ReloadOutlined" />
            </template>
            刷新
          </j-button>
        </j-space>
      </div>

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
        }"
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

        <template #action="slotProps">
          <j-space>
            <j-button
              @click="handleRemoveSingleDevice(slotProps)"
              type="link"
              style="padding: 0 5px"
              danger
            >
              <template #icon>
                <AIcon type="DeleteOutlined" />
              </template>
            </j-button>
          </j-space>
        </template>
      </JProTable>
    </div>

    <!-- 分配设备弹窗 -->
    <AssignDevice
      v-if="assignDeviceVisible"
      :laboratory-id="laboratory.id"
      @close="assignDeviceVisible = false"
      @save="saveAssignDevice"
    />
  </j-modal>
</template>

<script setup lang="ts">
import { LaboratoryAPI } from '@/api/device/laboratory';
import { query as queryDevices } from '@/api/device/instance';
import { onlyMessage } from '@/utils/comm';
import AssignDevice from './AssignDevice.vue';
import BadgeStatus from '@/components/BadgeStatus/index.vue';
import dayjs from 'dayjs';

interface Props {
  laboratory: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'changed']);

const deviceRef = ref<Record<string, any>>({});
const selectedDeviceIds = ref<string[]>([]);
const assignDeviceVisible = ref(false);

// 查询实验室下的设备列表（先查关联，再批量查详情）
const query = async (params: any) => {
  try {
    // 1) 获取该实验室已分配的设备ID
    const mappingResp = await LaboratoryAPI.devices(props.laboratory.id, { paging: false });
    const idList = (mappingResp?.result || []).map((m: any) => m.deviceId).filter(Boolean);
    if (!idList.length) {
      return { code: 200, status: 200, result: { data: [], pageIndex: 0, pageSize: params?.pageSize || 10, total: 0 } };
    }

    // 2) 用设备ID做 in 查询设备详情
    const pageSize = params?.pageSize || 10;
    const pageIndex = params?.current || 1;
    const resp = await queryDevices({
      pageSize,
      pageIndex,
      terms: [
        { column: 'id', termType: 'in', value: idList },
      ],
      sorts: params?.sorts || [{ name: 'createTime', order: 'desc' }],
    });

    const data = Array.isArray(resp?.result?.data) ? resp.result.data : (resp?.result || []);
    const total = typeof resp?.result?.total === 'number' ? resp.result.total : (resp?.total || 0);

    return {
      code: resp?.status || 200,
      status: resp?.status || 200,
      result: {
        data,
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
      result: { data: [], pageIndex: 0, pageSize: params?.pageSize || 10, total: 0 },
    };
  }
};

// 分配设备
const handleAssignDevice = () => {
  assignDeviceVisible.value = true;
};

// 移除设备
const handleRemoveDevice = async () => {
  try {
    await LaboratoryAPI.removeDevice(props.laboratory.id, selectedDeviceIds.value);
    onlyMessage('移除成功');
    selectedDeviceIds.value = [];
    onRefresh();
    emit('changed');
  } catch (error) {
    onlyMessage('移除失败', 'error');
  }
};

// 移除单个设备
const handleRemoveSingleDevice = async (device: any) => {
  try {
    await LaboratoryAPI.removeDevice(props.laboratory.id, [device.id]);
    onlyMessage('移除成功');
    onRefresh();
    emit('changed');
  } catch (error) {
    onlyMessage('移除失败', 'error');
  }
};

// 保存分配设备
const saveAssignDevice = () => {
  assignDeviceVisible.value = false;
  onRefresh();
  emit('changed');
};

// 选择变化
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedDeviceIds.value = selectedRowKeys;
};

// 全选
const selectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
  if (selected) {
    selectedDeviceIds.value = [
      ...selectedDeviceIds.value,
      ...changeRows.map((item) => item.id),
    ];
  } else {
    selectedDeviceIds.value = selectedDeviceIds.value.filter(
      (key) => !changeRows.find((item) => item.id === key),
    );
  }
};

// 刷新
const onRefresh = () => {
  deviceRef.value?.reload();
};

// 取消
const handleCancel = () => {
  emit('close');
};

// 表格列配置
const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '产品名称',
    dataIndex: 'productName',
    key: 'productName',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    scopedSlots: true,
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    scopedSlots: true,
    width: 200,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
    scopedSlots: true,
  },
];
</script>

<style scoped>
.device-list-container {
  height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.device-list-header {
  margin-bottom: 16px;
}

.device-list-container :deep(.ant-pro-table) {
  flex: 1;
  overflow: auto;
}
</style>
