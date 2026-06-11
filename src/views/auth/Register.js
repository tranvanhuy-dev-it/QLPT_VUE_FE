import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/auth.js";
import { useRouter } from "vue-router";

// ===================== Validation Rules =====================
const RULES = {
  username: {
    minLength: 4,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "Tên đăng nhập chỉ được chứa chữ cái không dấu, số và dấu gạch dưới (4–32 ký tự).",
  },
  password: {
    minLength: 8,
    // Ít nhất: 1 chữ hoa, 1 chữ thường, 1 số
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: "Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số.",
  },
  phone: {
    // Số điện thoại Việt Nam: 10 số, bắt đầu bằng 03|05|07|08|09
    pattern: /^(03|05|07|08|09)\d{8}$/,
    message: "Số điện thoại không hợp lệ (ví dụ: 0912345678).",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Địa chỉ email không hợp lệ.",
  },
  identityCard: {
    // CCCD 12 số hoặc CMND 9 số
    pattern: /^(\d{9}|\d{12})$/,
    message: "Số CMND/CCCD không hợp lệ (9 số cho CMND, 12 số cho CCCD).",
  },
  fullName: {
    minLength: 2,
    maxLength: 100,
    // Chỉ cho phép chữ cái (bao gồm tiếng Việt), khoảng trắng
    pattern: /^[\p{L}\s]+$/u,
    message: "Họ tên không được chứa số hoặc ký tự đặc biệt.",
  },
};

function validateField(rule, value) {
  if (!value || value.trim() === "") return null; // Bỏ qua trường không bắt buộc nếu trống

  if (rule.minLength && value.trim().length < rule.minLength) {
    return rule.message;
  }
  if (rule.maxLength && value.trim().length > rule.maxLength) {
    return rule.message;
  }
  if (rule.pattern && !rule.pattern.test(value.trim())) {
    return rule.message;
  }
  return null;
}

// ============================================================

export default {
  name: "Register",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const fullName = ref("");
    const phone = ref("");
    const email = ref("");
    const identityCard = ref("");
    const idCardIssueDate = ref("");
    const idCardIssuePlace = ref("");

    const error = ref("");
    const success = ref("");
    const loading = ref(false);

    // ---- Field-level errors (touched after first submit) ----
    const touched = ref(false);

    const usernameError = computed(() => {
      if (!touched.value && !username.value) return null;
      if (!username.value.trim()) return "Tên đăng nhập là bắt buộc.";
      return validateField(RULES.username, username.value);
    });

    const passwordError = computed(() => {
      if (!touched.value && !password.value) return null;
      if (!password.value) return "Mật khẩu là bắt buộc.";
      return validateField(RULES.password, password.value);
    });

    const confirmPasswordError = computed(() => {
      if (!touched.value && !confirmPassword.value) return null;
      if (!confirmPassword.value) return "Vui lòng nhập lại mật khẩu.";
      if (confirmPassword.value !== password.value) return "Mật khẩu nhập lại không khớp.";
      return null;
    });

    const fullNameError = computed(() => {
      if (!touched.value && !fullName.value) return null;
      if (!fullName.value.trim()) return "Họ và tên là bắt buộc.";
      return validateField(RULES.fullName, fullName.value);
    });

    const phoneError = computed(() => {
      if (!phone.value) return null; // Optional
      return validateField(RULES.phone, phone.value);
    });

    const emailError = computed(() => {
      if (!email.value) return null; // Optional
      return validateField(RULES.email, email.value);
    });

    const identityCardError = computed(() => {
      if (!identityCard.value) return null; // Optional
      return validateField(RULES.identityCard, identityCard.value);
    });

    const idCardIssueDateError = computed(() => {
      if (!idCardIssueDate.value) return null;
      const selected = new Date(idCardIssueDate.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected > today) return "Ngày cấp không được là ngày trong tương lai.";
      // Không được quá 50 năm trước
      const oldest = new Date();
      oldest.setFullYear(oldest.getFullYear() - 50);
      if (selected < oldest) return "Ngày cấp không hợp lệ.";
      return null;
    });

    // Overall form validity
    const isFormValid = computed(() => {
      return (
        !usernameError.value &&
        !passwordError.value &&
        !confirmPasswordError.value &&
        !fullNameError.value &&
        !phoneError.value &&
        !emailError.value &&
        !identityCardError.value &&
        !idCardIssueDateError.value &&
        username.value.trim() &&
        password.value &&
        confirmPassword.value &&
        fullName.value.trim()
      );
    });

    // Password strength indicator
    const passwordStrength = computed(() => {
      const p = password.value;
      if (!p) return { level: 0, label: "", color: "" };

      let score = 0;
      if (p.length >= 8) score++;
      if (p.length >= 12) score++;
      if (/[A-Z]/.test(p)) score++;
      if (/[a-z]/.test(p)) score++;
      if (/\d/.test(p)) score++;
      if (/[^a-zA-Z0-9]/.test(p)) score++;

      if (score <= 2) return { level: 1, label: "Yếu", color: "#ef4444" };
      if (score <= 3) return { level: 2, label: "Trung bình", color: "#f97316" };
      if (score <= 4) return { level: 3, label: "Khá", color: "#eab308" };
      return { level: 4, label: "Mạnh", color: "#22c55e" };
    });

    const handleRegister = async () => {
      touched.value = true;
      error.value = "";
      success.value = "";

      // Validate
      if (!isFormValid.value) {
        error.value = "Vui lòng kiểm tra lại thông tin đã nhập.";
        return;
      }

      loading.value = true;
      try {
        // SECURITY: Không truyền role — auth store sẽ không gửi role lên API,
        // backend tự assign LANDLORD cho endpoint /api/auth/register
        await authStore.register(
          username.value.trim(),
          password.value,
          email.value.trim(),
          phone.value.trim(),
          fullName.value.trim(),
          identityCard.value.trim(),
          idCardIssueDate.value ? idCardIssueDate.value : null,
          idCardIssuePlace.value.trim(),
        );

        success.value = "Đăng ký tài khoản thành công! Đang chuyển về trang Đăng nhập...";

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      fullName,
      phone,
      email,
      identityCard,
      idCardIssueDate,
      idCardIssuePlace,
      error,
      success,
      loading,
      touched,
      // Computed errors
      usernameError,
      passwordError,
      confirmPasswordError,
      fullNameError,
      phoneError,
      emailError,
      identityCardError,
      idCardIssueDateError,
      isFormValid,
      passwordStrength,
      handleRegister,
    };
  },
};
