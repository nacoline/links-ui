<template>
  <j-modal
    :visible="true"
    title="科室管理"
    @cancel="handleCancel"
    width="800px"
    :footer="null"
  >
    <div class="department-container">
      <div class="department-header">
        <j-space>
          <PermissionButton
            type="primary"
            @click="handleAddDepartment"
            hasPermission="device/Department:add"
          >
            <template #icon>
              <AIcon type="PlusOutlined" />
            </template>
            新增科室
          </PermissionButton>
        </j-space>
      </div>

      <j-table
        :columns="columns"
        :data-source="departmentList"
        :pagination="false"
        :loading="loading"
        row-key="id"
        :expandable="{ defaultExpandAllRows: true }"
      >
        <template #name="{ record }">
          <span>{{ record.name }}</span>
        </template>

        <template #createTime="{ record }">
          <span>{{ record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
        </template>

        <template #action="{ record }">
          <j-space>
            <PermissionButton
              @click="handleEditDepartment(record)"
              type="link"
              style="padding: 0 5px"
              hasPermission="device/Department:edit"
            >
              <template #icon>
                <AIcon type="EditOutlined" />
              </template>
            </PermissionButton>
            <PermissionButton
              :popConfirm="{
                title: '确认删除该科室？',
                onConfirm: () => handleDeleteDepartment(record),
              }"
              type="link"
              style="padding: 0 5px"
              danger
              hasPermission="device/Department:delete"
            >
              <template #icon>
                <AIcon type="DeleteOutlined" />
              </template>
            </PermissionButton>
          </j-space>
        </template>
      </j-table>
    </div>

    <!-- 科室表单弹窗 -->
    <DepartmentForm
      v-if="departmentFormVisible"
      :data="currentDepartment"
      @close="departmentFormVisible = false"
      @save="saveDepartment"
    />
  </j-modal>
</template>

<script setup lang="ts">
import { DepartmentAPI } from '@/api/device/laboratory';
import { onlyMessage } from '@/utils/comm';
import DepartmentForm from './DepartmentForm.vue';
import dayjs from 'dayjs';

const emit = defineEmits(['close']);

const loading = ref(false);
const departmentList = ref<any[]>([]);
const departmentFormVisible = ref(false);
const currentDepartment = ref<Record<string, any>>({});

// 获取科室列表
const getDepartmentList = async () => {
  try {
    loading.value = true;
    const resp = await DepartmentAPI.tree();
    departmentList.value = resp.result || [];
  } catch (error) {
    console.error('获取科室列表失败:', error);
    onlyMessage('获取科室列表失败', 'error');
  } finally {
    loading.value = false;
  }
};

// 新增科室
const handleAddDepartment = () => {
  currentDepartment.value = {};
  departmentFormVisible.value = true;
};

// 编辑科室
const handleEditDepartment = (record: any) => {
  currentDepartment.value = { ...record };
  departmentFormVisible.value = true;
};

// 删除科室
const handleDeleteDepartment = async (record: any) => {
  try {
    await DepartmentAPI.remove(record.id);
    onlyMessage('删除成功');
    getDepartmentList();
  } catch (error) {
    onlyMessage('删除失败', 'error');
  }
};

// 保存科室
const saveDepartment = () => {
  departmentFormVisible.value = false;
  getDepartmentList();
};

// 取消
const handleCancel = () => {
  emit('close');
};

// 表格列配置
const columns = [
  {
    title: '科室名称',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: true,
  },
  {
    title: '说明',
    dataIndex: 'describe',
    key: 'describe',
    ellipsis: true,
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
    width: 150,
    scopedSlots: true,
  },
];

// 初始化
onMounted(() => {
  getDepartmentList();
});
</script>

<style scoped>
.department-container {
  height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.department-header {
  margin-bottom: 16px;
}

.department-container :deep(.ant-table-wrapper) {
  flex: 1;
  overflow: auto;
}
</style>
