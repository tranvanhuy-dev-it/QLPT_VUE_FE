import { reactive } from 'vue';


export function useConfirmModal() {
  const confirmModal = reactive({
    show: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    showCancel: true,
    onConfirm: null,
  });

  const showAlert = (title, message, type = 'info', onOk = null) => {
    confirmModal.show = true;
    confirmModal.title = title;
    confirmModal.message = message;
    confirmModal.type = type;
    confirmModal.confirmText = 'Đã hiểu';
    confirmModal.showCancel = false;
    confirmModal.onConfirm = onOk;
  };

  const showConfirm = (title, message, type = 'warning', onConfirm = null) => {
    confirmModal.show = true;
    confirmModal.title = title;
    confirmModal.message = message;
    confirmModal.type = type;
    confirmModal.confirmText = 'Đồng ý';
    confirmModal.cancelText = 'Hủy';
    confirmModal.showCancel = true;
    confirmModal.onConfirm = onConfirm;
  };

  const onConfirmModal = () => {
    const cb = confirmModal.onConfirm;
    closeConfirmModal();
    if (typeof cb === 'function') cb();
  };

  const closeConfirmModal = () => {
    confirmModal.show = false;
    confirmModal.onConfirm = null;
  };

  return {
    confirmModal,
    showAlert,
    showConfirm,
    onConfirmModal,
    closeConfirmModal,
  };
}
