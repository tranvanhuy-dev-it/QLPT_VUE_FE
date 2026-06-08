<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    :class="[sizeClasses[size] || 'w-5 h-5', 'shrink-0']"
  >
    <!-- Calendar / Date -->
    <path
      v-if="name === 'calendar'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />

    <!-- Revenue Collected (Check circle) -->
    <path
      v-else-if="name === 'check-circle'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />

    <!-- Expected Revenue (Currency / Dollar) -->
    <path
      v-else-if="name === 'currency'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />

    <!-- Debt / Warning (Exclamation circle) -->
    <path
      v-else-if="name === 'exclamation-circle'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    />

    <!-- Home / Boarding house -->
    <path
      v-else-if="name === 'home'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />

    <!-- Bed / Room -->
    <path
      v-else-if="name === 'door'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />

    <!-- User / Tenant -->
    <path
      v-else-if="name === 'user'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />

    <!-- Document / Contract -->
    <path
      v-else-if="name === 'contract'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />

    <!-- Invoice -->
    <path
      v-else-if="name === 'invoice'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />

    <!-- Arrow Right -->
    <path
      v-else-if="name === 'arrow-right'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />

    <!-- Arrow Left -->
    <path
      v-else-if="name === 'arrow-left'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />

    <!-- Building -->
    <path
      v-else-if="name === 'building'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />

    <!-- Room (House outline) -->
    <path
      v-else-if="name === 'room'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />

    <!-- Contract Alt -->
    <path
      v-else-if="name === 'contract-alt'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />

    <!-- Invoice Alt -->
    <path
      v-else-if="name === 'invoice-alt'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />

    <!-- Clock -->
    <path
      v-else-if="name === 'clock'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />

    <!-- Plus -->
    <path
      v-else-if="name === 'plus'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />

    <!-- Exclamation Triangle -->
    <path
      v-else-if="name === 'exclamation-triangle' || name === 'warning'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />

    <!-- Map Pin -->
    <g v-else-if="name === 'map-pin'">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </g>

    <!-- Eye -->
    <g v-else-if="name === 'eye'">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </g>

    <!-- Trash -->
    <path
      v-else-if="name === 'trash'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />

    <!-- Currency Alt -->
    <path
      v-else-if="name === 'currency-alt' || name === 'coin'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m11.25 11.25.041-.02a.75.75 0 1 1 .512 1.35h-.488a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v2.25a2.25 2.25 0 0 1-.75 1.688m-6 3h12"
    />

    <!-- User Card -->
    <path
      v-else-if="name === 'user-card'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm-1.2 6.44a3 3 0 1 1-5.1 0 3 3 0 0 1 5.1 0Z"
    />

    <!-- Lock (Padlock closed, same as door) -->
    <path
      v-else-if="name === 'lock'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />

    <!-- Lock Open -->
    <path
      v-else-if="name === 'lock-open'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />

    <!-- Key -->
    <path
      v-else-if="name === 'key'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
    />

    <!-- Pencil / Edit -->
    <path
      v-else-if="name === 'pencil' || name === 'edit'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
    />

    <!-- Info Circle -->
    <path
      v-else-if="name === 'info-circle'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 18v-5.25m0-3h.008v.008H12V9.75zm0.5 7.5a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0z"
    />

    <!-- Paper Airplane -->
    <path
      v-else-if="name === 'paper-airplane' || name === 'zalo'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />

    <!-- Printer -->
    <g v-else-if="name === 'printer'">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.816V8.16m10.56 5.656V8.16m-10.56 5.656h10.56m-10.56 0h10.56m-10.56 0v5.656m0-5.656v-5.656m10.56 5.656v5.656m0-5.656v-5.656m-10.56 0V3.75h10.56v4.41" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5h-13.5A2.25 2.25 0 0 1 3 17.25V13.816a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v3.434a2.25 2.25 0 0 1-2.25 2.25Z" />
    </g>

    <!-- Credit Card -->
    <path
      v-else-if="name === 'credit-card'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z"
    />

    <!-- Minus Circle -->
    <path
      v-else-if="name === 'minus-circle'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
</template>

<script>
export default {
  name: 'AppIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'md' // 'sm', 'md', 'lg', 'xl'
    }
  },
  setup() {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8'
    };
    return { sizeClasses };
  }
};
</script>
