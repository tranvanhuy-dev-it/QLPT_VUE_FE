<template>
  <div class="p-6 bg-bg-main min-h-full">

    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs mt-6">
      <DataTable :headers="tableHeaders" :items="invoices" :loading="loading"
        loadingText="Đang tải danh sách hóa đơn..." emptyText="Chưa có hóa đơn nào được tạo cho bạn." showPagination
        :page="page" :totalPages="totalPages" :totalElements="totalElements" unit="hóa đơn" clickable
        @change-page="changePage" @row-click="(item) => viewDetails(item.id)"
      >
        <!-- Custom slot for Billing Period (2 lines) -->
        <template #cell(billingPeriod)="{ item }">
          <div class="flex flex-col gap-0.5 text-xs text-text-sub font-semibold">
            <span>{{ formatDate(item.billingPeriodStart) }}</span>
            <span>- {{ formatDate(item.billingPeriodEnd) }}</span>
          </div>
        </template>

        <!-- Custom slot for Status Badge -->
        <template #cell(status)="{ item, value }">
          <span v-if="value === 'PAID'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400">
            Đã thanh toán
          </span>
          <span v-else-if="item.paymentClaimed" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400 border border-amber-300 animate-pulse">
            Chờ xác nhận
          </span>
          <span v-else-if="value === 'PARTIALLY_PAID'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/35 dark:text-blue-400">
            Trả một phần
          </span>
          <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400">
            Chưa đóng tiền
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script src="./TenantInvoices.js"></script>
