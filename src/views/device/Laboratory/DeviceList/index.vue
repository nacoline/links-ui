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
          onSelect: onSelectChange,
          onSelectAll: selectAll,
          onSelectNone: () => (selectedDeviceIds = []),
        }"
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
import { onlyMessage } from '@/utils/comm';
import AssignDevice from './AssignDevice.vue';
import BadgeStatus from '@/components/BadgeStatus/index.vue';
import dayjs from 'dayjs';

interface Props {
  laboratory: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const deviceRef = ref<Record<string, any>>({});
const selectedDeviceIds = ref<string[]>([]);
const assignDeviceVisible = ref(false);

// 查询实验室下的设备列表
const query = async (params: any) => {
  try {
    const resp = await LaboratoryAPI.devices(props.laboratory.id, params);
    return {
      code: resp.status,
      result: resp.result,
      status: resp.status,
    };
  } catch (error) {
    console.error('查询设备列表失败:', error);
    return {
      code: 500,
      result: [],
      status: 500,
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
  } catch (error) {
    onlyMessage('移除失败', 'error');
  }
};

// 保存分配设备
const saveAssignDevice = () => {
  assignDeviceVisible.value = false;
  onRefresh();
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
