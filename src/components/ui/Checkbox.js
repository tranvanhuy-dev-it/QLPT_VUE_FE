export default {
  name: "Checkbox",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const onCheckedChange = (event) => {
      emit("update:modelValue", event.target.checked);
    };

    return {
      onCheckedChange,
    };
  },
};
