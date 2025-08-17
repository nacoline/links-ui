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



      <j-form-item label="实验室地址" name="address">
        <j-input
          v-model:value="form.address"
          placeholder="请输入实验室地址"
          :maxLength="200"
        />
      </j-form-item>

      <j-form-item label="负责人" name="manager">
        <j-input
          v-model:value="form.manager"
          placeholder="请输入负责人"
          :maxLength="50"
        />
      </j-form-item>

      <j-form-item label="联系电话" name="phone">
        <j-input
          v-model:value="form.phone"
          placeholder="请输入联系电话"
          :maxLength="20"
        />
      </j-form-item>

      <j-form-item label="邮箱" name="email">
        <j-input
          v-model:value="form.email"
          placeholder="请输入邮箱"
          :maxLength="100"
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
import { LaboratoryAPI } from '@/api/device/laboratory';
import { onlyMessage } from '@/utils/comm';

interface Props {
  data: Record<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'save']);

const formRef = ref();
const loading = ref(false);


const form = ref({
  name: '',
  address: '',
  manager: '',
  phone: '',
  email: '',
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
      address: props.data.address || '',
      manager: props.data.manager || '',
      phone: props.data.phone || '',
      email: props.data.email || '',
      describe: props.data.describe || '',
    };
  } else {
    form.value = {
      name: '',
      address: '',
      manager: '',
      phone: '',
      email: '',
      describe: '',
    };
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
});
</script>
