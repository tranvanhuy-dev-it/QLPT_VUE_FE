<template>
  <div class="p-6 bg-bg-main min-h-full">

    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs mt-6">
      <DataTable :headers="tableHeaders" :items="invoices" :loading="loading"
        loadingText="Đang tải danh sách hóa đơn..." emptyText="Chưa có hóa đơn nào được tạo cho bạn." showPagination
        :page="page" :totalPages="totalPages" :totalElements="totalElements" unit="hóa đơn" clickable
        @change-page="changePage" @row-click="(item) => viewDetails(item.id)" />
    </div>
  </div>
</template>

<script src="./TenantInvoices.js"></script>
