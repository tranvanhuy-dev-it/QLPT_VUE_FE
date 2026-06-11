<template>
  <div class="p-4 bg-bg-main min-h-full contracts-page">
    <PageHeader 
      title="Hợp Đồng Thuê Phòng"
      subtitle="Quản lý hợp đồng thuê, tiền đặt cọc và dịch vụ đính kèm của khách trọ" 
      :icon="contractIcon"
      :showAdd="isLandlord" 
      addText="Tạo hợp đồng" 
      searchPlaceholder="Tìm theo tên người thuê, phòng, dãy trọ..." 
      v-model="searchQuery"
      @add-click="goToCreateContract" 
    />

    <!-- Contracts List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredContracts"
        :loading="loading"
        loadingText="Đang tải danh sách hợp đồng..."
        emptyText="Không tìm thấy hợp đồng nào."
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="hợp đồng"
        :clickable="true"
        @change-page="changePage"
        @row-click="(item) => viewContractDetail(item.id)"
      />
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :confirmText="confirmModal.confirmText"
      :cancelText="confirmModal.cancelText"
      :showCancel="confirmModal.showCancel"
      @confirm="onConfirmModal"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script src="./Contracts.js"></script>
