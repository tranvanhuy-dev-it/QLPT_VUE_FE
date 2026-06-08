<template>
  <div class="p-6 bg-bg-main min-h-full">
    <PageHeader 
      title="Hóa Đơn Của Tôi" 
      subtitle="Xem danh sách và kiểm tra chi tiết hóa đơn thanh toán tiền phòng, dịch vụ hàng tháng" 
      :icon="invoiceIcon"
      :showSearch="false"
    />

    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs mt-6">
      <DataTable
        :headers="tableHeaders"
        :items="invoices"
        :loading="loading"
        loadingText="Đang tải danh sách hóa đơn..."
        emptyText="Chưa có hóa đơn nào được tạo cho bạn."
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="hóa đơn"
        @change-page="changePage"
      >
        <template #cell(actions)="{ item }">
          <FormButton variant="secondary" size="sm" @click="viewDetails(item)" class="!px-2.5 !py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Xem Phiếu Chi Tiết</span>
          </FormButton>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script src="./TenantInvoices.js"></script>
