import { reactive } from 'vue';

/**
 * Composable to manage a custom ConfirmModal dialog.
 * Replaces native alert() and confirm() with a polished in-app modal.
 *
 * Usage:
 *   const { confirmModal, showAlert, showConfirm, closeConfirmModal } = useConfirmModal();
 *
 *   // Alert (info/success/warning/danger - only OK button)
 *   showAlert('Thành công', 'Tạo tài khoản thành công!', 'success');
 *
 *   // Confirm (two buttons - calls callback on confirm)
 *   showConfirm('Xác nhận', 'Bạn có chắc chắn?', 'danger', () => { ... });
 */
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
