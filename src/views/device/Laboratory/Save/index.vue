<template>
  <j-modal
    :visible="true"
    :title="data.id ? '编辑实验室' : '新增实验室'"
    @cancel="handleCancel"
    @ok="handleOk"
    :confirmLoading="loading"
    width="600px"
  >
    <j-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
    >
      <j-form-item label="实验室名称" name="name">
        <j-input
          v-model:value="form.name"
          placeholder="请输入实验室名称"
          :maxLength="50"
        />
      </j-form-item>

      <j-form-item label="所属科室" name="departmentId">
        <j-tree-select
          v-model:value="form.departmentId"
          :tree-data="departmentOptions"
          placeholder="请选择所属科室"
          :field-names="{ children: 'children', label: 'name', value: 'id' }"
          tree-default-expand-all
          allow-clear
        />
      </j-form-item>

      <j-form-item label="说明" name="describe">
        <j-textarea
          v-model:value="form.describe"
          placeholder="请输入说明"
          :rows="4"
          :maxLength="200"
        />
      </j-form-item>
    </j-form>
  </j-modal>
</template>

<script setup lang="ts">
import { LaboratoryAPI, DepartmentAPI } from '@/api/device/laboratory';
import { onlyMessage } from '@/utils/comm';

interface Props {
  data: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'save']);

const formRef = ref();
const loading = ref(false);
const departmentOptions = ref<any[]>([]);

const form = ref({
  name: '',
  departmentId: undefined,
  describe: '',
});

const rules = {
  name: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' },
    { max: 50, message: '实验室名称不能超过50个字符', trigger: 'blur' },
  ],
  describe: [
    { max: 200, message: '说明不能超过200个字符', trigger: 'blur' },
  ],
};

// 初始化表单数据
const initForm = () => {
  if (props.data.id) {
    form.value = {
      name: props.data.name || '',
      departmentId: props.data.departmentId,
      describe: props.data.describe || '',
    };
  } else {
    form.value = {
      name: '',
      departmentId: undefined,
      describe: '',
    };
  }
};

// 获取科室选项
const getDepartmentOptions = async () => {
  try {
    const resp = await DepartmentAPI.tree();
    departmentOptions.value = resp.result || [];
  } catch (error) {
    console.error('获取科室列表失败:', error);
  }
};

// 取消
const handleCancel = () => {
  emit('close');
};

// 确定
const handleOk = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    if (props.data.id) {
      await LaboratoryAPI.update(props.data.id, form.value);
      onlyMessage('更新成功');
    } else {
      await LaboratoryAPI.save(form.value);
      onlyMessage('新增成功');
    }

    emit('save');
  } catch (error) {
    console.error('保存失败:', error);
    onlyMessage('保存失败', 'error');
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  initForm();
  getDepartmentOptions();
});
</script>
