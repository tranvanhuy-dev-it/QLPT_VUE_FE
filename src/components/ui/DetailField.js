export default {
  name: "DetailField",
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      default: "",
    },
    layout: {
      type: String,
      default: "block", // "block" hoặc "inline"
      validator: (value) => ["block", "inline"].includes(value),
    },
    labelWidth: {
      type: String,
      default: "w-36", // Chỉ áp dụng cho layout="inline"
    },
    labelClass: {
      type: [String, Array, Object],
      default: "",
    },
    valueClass: {
      type: [String, Array, Object],
      default: "",
    },
  },
};
