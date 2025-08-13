<template>
  <page-container>
    <pro-search
      :columns="columns"
      target="laboratory"
      @search="handleSearch"
    />
    <FullPage>
      <JProTable
        ref="laboratoryRef"
        :columns="columns"
        :request="query"
        :defaultParams="{
          sorts: [{ name: 'createTime', order: 'desc' }],
        }"
        :params="params"
      >
        <template #headerTitle>
          <j-space>
            <PermissionButton
              type="primary"
              @click="handleAdd"
              hasPermission="device/Laboratory:add"
            >
              <template #icon>
                <AIcon type="PlusOutlined" />
              </template>
              新增实验室
            </PermissionButton>
            <PermissionButton
              @click="handleDepartment"
              hasPermission="device/Department:view"
            >
              <template #icon>
                <AIcon type="TeamOutlined" />
              </template>
              科室管理
            </PermissionButton>
          </j-space>
        </template>

        <template #departmentName="slotProps">
          <span>{{ slotProps.departmentName || '未分配' }}</span>
        </template>

        <template #deviceCount="slotProps">
          <j-button
            type="link"
            @click="viewDevices(slotProps)"
            :disabled="!slotProps.deviceCount"
          >
            {{ slotProps.deviceCount || 0 }} 台
          </j-button>
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
            <PermissionButton
              @click="handleEdit(slotProps)"
              type="link"
              style="padding: 0 5px"
              hasPermission="device/Laboratory:edit"
            >
              <template #icon>
                <AIcon type="EditOutlined" />
              </template>
            </PermissionButton>
            <PermissionButton
              @click="viewDevices(slotProps)"
              type="link"
              style="padding: 0 5px"
              hasPermission="device/Laboratory:view"
            >
              <template #icon>
                <AIcon type="SettingOutlined" />
              </template>
            </PermissionButton>
            <PermissionButton
              :popConfirm="{
                title: '确认删除该实验室？',
                onConfirm: () => handleDelete(slotProps),
              }"
              type="link"
              style="padding: 0 5px"
              danger
              hasPermission="device/Laboratory:delete"
            >
              <template #icon>
                <AIcon type="DeleteOutlined" />
              </template>
            </PermissionButton>
          </j-space>
        </template>
      </JProTable>
    </FullPage>

    <!-- 实验室表单弹窗 -->
    <Save
      v-if="visible"
      :data="current"
      @close="visible = false"
      @save="saveBtn"
    />

    <!-- 科室管理弹窗 -->
    <Department
      v-if="departmentVisible"
      @close="departmentVisible = false"
    />

    <!-- 设备列表弹窗 -->
    <DeviceList
      v-if="deviceListVisible"
      :laboratory="currentLaboratory"
      @close="deviceListVisible = false"
    />
  </page-container>
</template>

<script setup lang="ts">
import { LaboratoryAPI, DepartmentAPI } from '@/api/device/laboratory';
import { onlyMessage } from '@/utils/comm';
import Save from './Save/index.vue';
import Department from './Department/index.vue';
import DeviceList from './DeviceList/index.vue';
import dayjs from 'dayjs';

const laboratoryRef = ref<Record<string, any>>({});
const params = ref<Record<string, any>>({});
const visible = ref<boolean>(false);
const current = ref<Record<string, any>>({});
const departmentVisible = ref<boolean>(false);
const deviceListVisible = ref<boolean>(false);
const currentLaboratory = ref<Record<string, any>>({});

// 查询实验室列表
const query = async (params: any) => {
  try {
    const resp = await LaboratoryAPI.query(params);
    return {
      code: resp.status,
      result: resp.result,
      status: resp.status,
    };
  } catch (error) {
    console.error('查询实验室列表失败:', error);
    return {
      code: 500,
      result: [],
      status: 500,
    };
  }
};

// 搜索处理
const handleSearch = (searchParams: any) => {
  params.value = searchParams;
};

// 新增实验室
const handleAdd = () => {
  current.value = {};
  visible.value = true;
};

// 编辑实验室
const handleEdit = (record: any) => {
  current.value = { ...record };
  visible.value = true;
};

// 科室管理
const handleDepartment = () => {
  departmentVisible.value = true;
};

// 查看设备列表
const viewDevices = (laboratory: any) => {
  currentLaboratory.value = laboratory;
  deviceListVisible.value = true;
};

// 删除实验室
const handleDelete = async (record: any) => {
  try {
    await LaboratoryAPI.remove(record.id);
    onlyMessage('删除成功');
    onRefresh();
  } catch (error) {
    onlyMessage('删除失败', 'error');
  }
};

// 保存回调
const saveBtn = () => {
  visible.value = false;
  onRefresh();
};

// 刷新
const onRefresh = () => {
  laboratoryRef.value?.reload();
};

// 表格列配置
const columns = [
  {
    title: '实验室名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    search: {
      type: 'string',
      first: true,
    },
  },
  {
    title: '所属科室',
    dataIndex: 'departmentName',
    key: 'departmentName',
    scopedSlots: true,
    search: {
      type: 'treeSelect',
      options: () =>
        new Promise((resolve) => {
          DepartmentAPI.tree().then((resp: any) => {
            resolve(resp.result || []);
          });
        }),
    },
  },
  {
    title: '设备数量',
    dataIndex: 'deviceCount',
    key: 'deviceCount',
    scopedSlots: true,
    width: 120,
  },
  {
    title: '说明',
    dataIndex: 'describe',
    key: 'describe',
    ellipsis: true,
    search: {
      type: 'string',
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
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
    scopedSlots: true,
  },
];
</script>

<style scoped>
.laboratory-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
