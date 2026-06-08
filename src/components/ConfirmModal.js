export default {
  name: 'ConfirmModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Xác nhận',
    },
    message: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: 'Đồng ý',
    },
    cancelText: {
      type: String,
      default: 'Hủy',
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'info', // 'info', 'success', 'warning', 'danger'
    },
  },
  emits: ['confirm', 'cancel'],
};
