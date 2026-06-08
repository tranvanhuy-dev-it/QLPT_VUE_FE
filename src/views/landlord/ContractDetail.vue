<template>
  <div class="p-4 bg-bg-main min-h-full print:bg-white print:p-0">
    <!-- Header Block (hidden during print) -->
    <div class="mb-6 pb-4 border-b border-border-main no-print flex flex-col gap-4">
      <!-- Top Row: Back button + Title + Status -->
      <div class="flex items-center gap-2">
        <button @click="goBack"
          class="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-main bg-card hover:bg-slate-50 transition cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
          <span>Chi Tiết Hợp Đồng</span>
          <span v-if="contract" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border',
            contract.status === 'ACTIVE'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          ]">
            {{ contract.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thanh lý' }}
          </span>
        </h2>
      </div>

      <!-- Bottom Row: 4 buttons in a horizontal flex row -->
      <div v-if="contract" class="flex flex-row items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">
        <!-- Tab Switcher -->
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button @click="activeTab = 'summary'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'summary' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Tóm tắt
          </button>
          <button @click="activeTab = 'contract'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'contract' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Bản in
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Print Button (visible on contract tab) -->
          <FormButton v-if="activeTab === 'contract'" variant="primary" size="sm" @click="showPreviewModal = true"
            class="!px-2.5 !py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6.72 13.816V8.16m10.56 5.656V8.16m-10.56 5.656h10.56m-10.56 0h10.56m-10.56 0v5.656m0-5.656v-5.656m10.56 5.656v5.656m0-5.656v-5.656m-10.56 0V3.75h10.56v4.41" />
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M18.75 19.5h-13.5A2.25 2.25 0 0 1 3 17.25V13.816a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v3.434a2.25 2.25 0 0 1-2.25 2.25Z" />
            </svg>
            <span>In hợp đồng</span>
          </FormButton>

          <FormButton v-if="activeTab === 'summary' && contract.status === 'ACTIVE'" variant="danger" size="sm"
            @click="terminateContract" class="!px-2.5 !py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Thanh lý</span>
          </FormButton>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading"
      class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải chi tiết hợp đồng...</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-else-if="contract" class="flex flex-col gap-4">

      <!-- SUMMARY TAB VIEW -->
      <div v-if="activeTab === 'summary'" class="flex flex-col gap-4">
        <!-- Room Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin phòng trọ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Dãy trọ:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.room.boardingHouse.name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Phòng số:</span>
              <span class="font-bold text-primary flex-1">Phòng {{ contract.room.roomNumber }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Giá phòng gốc:</span>
              <span class="font-bold text-text-main flex-1">{{ formatMoney(contract.contractedRoomPrice) }}
                đ/tháng</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Sức chứa tối đa:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.room.maxPeople }} người</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Số điện hiện tại:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.room.currentElectricityIndex }} kWh</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Số nước hiện tại:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.room.currentWaterIndex }} m³</span>
            </div>
          </div>
        </div>

        <!-- Contract Terms Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Điều khoản hợp đồng</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Ngày bắt đầu thuê:</span>
              <span class="font-semibold text-text-main flex-1">{{ formatDate(contract.startDate) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Ngày hết hạn:</span>
              <span class="font-semibold text-text-main flex-1">{{ formatDate(contract.endDate) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Tiền đặt cọc:</span>
              <span class="font-bold text-green-600 flex-1">{{ formatMoney(contract.deposit) }} đ</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Kỳ hạn tính tiền:</span>
              <span class="font-semibold text-text-main flex-1">Thanh toán vào cuối tháng</span>
            </div>
          </div>
        </div>

        <!-- Tenant Info Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin khách thuê</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Đại diện thuê:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.tenant.fullName }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Tài khoản:</span>
              <span class="font-mono text-text-main flex-1">{{ contract.tenant.username }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Số điện thoại:</span>
              <span class="font-bold text-text-main flex-1">{{ contract.tenant.phone || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-text-sub font-semibold w-36 shrink-0">Email liên hệ:</span>
              <span class="font-semibold text-text-main flex-1 break-all">{{ contract.tenant.email || 'Chưa cập nhật'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Occupants & Extra fees Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Số người ở & Dịch vụ</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border border-border-main/50 text-xs">
              <span class="text-text-sub block mb-2 font-medium">Số người đang ở thực tế:</span>
              <span class="font-bold text-text-main text-sm">{{ contract.numberOfTenants }} người</span>
            </div>

            <!-- Right Side: Services applied -->
            <div class="text-xs">
              <span class="text-text-sub font-semibold block mb-2.5">Dịch vụ đi kèm:</span>
              <div v-if="extraFees.length === 0" class="text-center py-4 text-text-sub italic">
                Không có dịch vụ đi kèm
              </div>
              <div v-else class="flex flex-col gap-2">
                <div v-for="cef in extraFees" :key="cef.id"
                  class="border border-border-main/40 rounded p-2.5 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                  <div>
                    <span class="font-semibold text-text-main block">{{ cef.extraFee.name }}</span>
                    <span class="text-[10px] text-text-sub">
                      {{ formatMoney(cef.customPrice) }} đ/{{ cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' :
                        'phòng' }}
                    </span>
                  </div>
                  <span class="font-bold text-primary shrink-0 ml-2">
                    {{ formatMoney(cef.extraFee.unitType === 'FIXED_PER_PERSON' ? cef.customPrice *
                      contract.numberOfTenants : cef.customPrice) }} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Addendums History Card -->
        <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
          <div class="flex items-center justify-between border-b border-border-main pb-2.5 mb-4">
            <h3 class="text-sm font-bold text-text-main">Lịch sử phụ lục hợp đồng</h3>
            <FormButton v-if="contract.status === 'ACTIVE'" variant="primary" size="sm" @click="openAddendumModal" class="!px-2.5 !py-1.5">
              + Thêm phụ lục
            </FormButton>
          </div>

          <div v-if="loadingAddendums" class="text-center py-6 text-text-sub text-xs">
            <div class="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Đang tải...
          </div>

          <div v-else-if="addendums.length === 0" class="text-center py-6 text-text-sub text-xs italic">
            Chưa có phụ lục nào.
          </div>

          <div v-else class="flex flex-col gap-3">
            <div v-for="(addendum, index) in addendums" :key="addendum.id"
              :class="['border rounded-xl p-3.5 text-xs', index === 0 ? 'border-primary/40 bg-primary/5' : 'border-border-main/50 bg-slate-50/30 dark:bg-slate-900/20']">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-text-main text-sm flex items-center gap-2">
                  {{ addendum.description || 'Phụ lục #' + (addendums.length - index) }}
                  <span v-if="index === 0" class="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold">Hiện hành</span>
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-text-sub text-[11px]">Từ {{ formatDate(addendum.startDate) }}</span>
                  <button @click.stop="openPrintAddendumModal(addendum, addendums.length - index)"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition cursor-pointer"
                    title="In phụ lục hợp đồng">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                      stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.72 13.816V8.16m10.56 5.656V8.16m-10.56 5.656h10.56m-10.56 0h10.56m-10.56 0v5.656m0-5.656v-5.656m10.56 5.656v5.656m0-5.656v-5.656m-10.56 0V3.75h10.56v4.41" />
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M18.75 19.5h-13.5A2.25 2.25 0 0 1 3 17.25V13.816a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v3.434a2.25 2.25 0 0 1-2.25 2.25Z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5">
                <div><span class="text-text-sub">Giá phòng:</span> <span class="font-bold text-text-main">{{ formatMoney(addendum.roomPrice) }} đ</span></div>
                <div><span class="text-text-sub">Giá điện:</span> <span class="font-bold text-text-main">{{ formatMoney(addendum.electricityRate) }} đ/kWh</span></div>
                <div><span class="text-text-sub">Giá nước:</span> <span class="font-bold text-text-main">{{ formatMoney(addendum.waterRate) }} đ</span></div>
                <div><span class="text-text-sub">Tính nước:</span> <span class="font-semibold text-text-main">{{ formatWaterBillingType(addendum.waterBillingType) }}</span></div>
                <div><span class="text-text-sub">Số người:</span> <span class="font-bold text-text-main">{{ addendum.numberOfTenants }}</span></div>
              </div>
              <div v-if="addendum.extraFees && addendum.extraFees.length > 0" class="mt-2 pt-2 border-t border-border-main/30">
                <span class="text-text-sub text-[10px] font-semibold uppercase">Phụ phí:</span>
                <div class="flex flex-wrap gap-1.5 mt-1">
                  <span v-for="ef in addendum.extraFees" :key="ef.id" class="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-text-sub">
                    {{ ef.extraFee.name }}: {{ formatMoney(ef.customPrice) }}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LEGAL CONTRACT TAB VIEW (A4 Preview & printable layout) -->
      <div v-else-if="activeTab === 'contract'" id="contract-print-area"
        class="print-contract-container bg-white dark:bg-slate-950 p-4 sm:p-12 md:p-16 border border-border-main rounded-2xl shadow-xs max-w-4xl mx-auto text-text-main font-serif relative">
        <!-- National Emblem Header -->
        <div class="text-center mb-6">
          <h4 class="font-bold text-sm sm:text-base tracking-widest uppercase text-black dark:text-white">CỘNG HÒA XÃ
            HỘI CHỦ NGHĨA VIỆT NAM</h4>
          <h5 class="font-semibold text-xs sm:text-sm tracking-wide mt-1 text-black dark:text-white">Độc lập – Tự do –
            Hạnh phúc</h5>
          <div class="w-32 h-[1px] bg-black dark:bg-white mx-auto mt-2"></div>
        </div>

        <h3 class="text-center font-bold text-lg sm:text-2xl uppercase tracking-widest my-8 text-black dark:text-white">
          HỢP ĐỒNG THUÊ PHÒNG TRỌ</h3>

        <!-- Contract Description intro -->
        <div class="space-y-4 text-xs sm:text-sm leading-relaxed text-justify text-black dark:text-slate-200">
          <p>Hôm nay, ngày {{ currentDay }} tháng {{ currentMonth }} năm {{ currentYear }}, tại địa chỉ dãy trọ chúng
            tôi gồm:</p>

          <!-- Bên A -->
          <div>
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN A: BÊN CHO THUÊ (LANDLORD)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ contract.room.boardingHouse.landlord?.fullName ||
                '......................................................' }}</div>
              <div><strong>Số điện thoại:</strong> {{ contract.room.boardingHouse.landlord?.phone ||
                '......................................................' }}</div>
              <div><strong>Số CMND/CCCD:</strong> {{ contract.room.boardingHouse.landlord?.identityCard ||
                '......................................................' }}</div>
              <div><strong>Ngày cấp:</strong> {{ contract.room.boardingHouse.landlord?.idCardIssueDate ?
                formatDate(contract.room.boardingHouse.landlord.idCardIssueDate) : '.........................' }}</div>
              <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{
                contract.room.boardingHouse.landlord?.idCardIssuePlace || '.........................' }}</div>
              <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ contract.room.boardingHouse.address ||
                '......................................................' }}</div>
            </div>
          </div>

          <!-- Bên B -->
          <div class="pt-2">
            <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN B: BÊN THUÊ PHÒNG (TENANT)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
              <div><strong>Họ và tên:</strong> {{ contract.tenant.fullName }}</div>
              <div><strong>Tài khoản hệ thống:</strong> {{ contract.tenant.username }}</div>
              <div><strong>Số điện thoại:</strong> {{ contract.tenant.phone ||
                '......................................................' }}</div>
              <div><strong>Email:</strong> {{ contract.tenant.email ||
                '......................................................' }}</div>
              <div><strong>Số CMND/CCCD:</strong> {{ contract.tenant.identityCard ||
                '......................................................' }}</div>
              <div><strong>Ngày cấp:</strong> {{ contract.tenant.idCardIssueDate ?
                formatDate(contract.tenant.idCardIssueDate) : '.........................' }}</div>
              <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{ contract.tenant.idCardIssuePlace ||
                '.........................' }}</div>
              <div class="sm:col-span-2"><strong>Hộ khẩu thường trú:</strong> {{ contract.tenant.permanentAddress ||
                '................................................................................................' }}
              </div>
              <div class="sm:col-span-2"><strong>Số người cùng ở thực tế:</strong> {{ contract.numberOfTenants }} người.
              </div>
            </div>
          </div>

          <p class="pt-2">Hai bên cùng thống nhất các điều khoản thuê phòng trọ dưới đây:</p>

          <!-- Điều 1 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 1: THÔNG TIN PHÒNG THUÊ VÀ BÀN GIAO</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Bên A đồng ý cho Bên B thuê phòng số: <strong>Phòng {{ contract.room.roomNumber }}</strong> thuộc
                dãy trọ: <strong>{{ contract.room.boardingHouse.name }}</strong> tại địa chỉ: <strong>{{
                  contract.room.boardingHouse.address }}</strong>.</li>
              <li>- Mục đích sử dụng: Dùng để ở và sinh hoạt của Bên B và những người được đăng ký hợp pháp.</li>
              <li>- Chỉ số công tơ điện bàn giao đầu kỳ: <strong>{{ contract.room.currentElectricityIndex }}
                  kWh</strong>.</li>
              <li v-if="contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">- Chỉ số đồng hồ nước bàn giao đầu
                kỳ: <strong>{{ contract.room.currentWaterIndex }} m³</strong>.</li>
              <li>- Trạng thái phòng trọ: Phòng sạch sẽ, hệ thống cửa, khóa, thiết bị vệ sinh hoạt động tốt bình thường.
              </li>
            </ul>
          </div>

          <!-- Điều 2 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 2: THỜI HẠN THUÊ VÀ ĐIỀU KHOẢN ĐẶT CỌC</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Hợp đồng bắt đầu có hiệu lực từ ngày: <strong>{{ formatDate(contract.startDate) }}</strong>.</li>
              <li>- Ngày kết thúc / hết hạn hợp đồng: <strong>{{
                contract.endDate ? formatDate(contract.endDate) : 'Chưa thiết lập ngày kết thúc' }}</strong>.</li>
              <li>- Tiền đặt cọc bảo đảm Bên B gửi Bên A giữ là: <strong>{{ formatMoney(contract.deposit) }} đ</strong>
                (Bằng chữ: <em>{{ docTienBangChu(contract.deposit) }} đồng</em>). Tiền đặt cọc này sẽ được hoàn trả đầy
                đủ cho Bên B khi chấm dứt hợp đồng thuê trọ đúng hạn, Bên B đã bàn giao phòng hoàn chỉnh và thanh toán
                đầy đủ các khoản tiền phòng, dịch vụ còn nợ (nếu có).</li>
              <li>- Trường hợp Bên B tự ý chấm dứt hợp đồng trước thời hạn mà không báo trước cho Bên A ít nhất 7 ngày,
                Bên B sẽ bị mất số tiền đặt cọc này.</li>
            </ul>
          </div>

          <!-- Điều 3 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 3: GIÁ THUÊ PHÒNG, ĐƠN GIÁ DỊCH VỤ VÀ PHƯƠNG
              THỨC THANH TOÁN</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Tiền thuê phòng cố định hàng tháng: <strong>{{ formatMoney(contract.contractedRoomPrice) }}
                  đ/tháng</strong> (Bằng chữ: <em>{{ docTienBangChu(contract.contractedRoomPrice) }} đồng/tháng</em>).
              </li>
              <li>- Đơn giá các loại dịch vụ điện, nước tiêu thụ hằng tháng:
                <ul class="list-none pl-5 mt-1 space-y-0.5">
                  <li>+ Giá điện: <strong>{{ formatMoney(contract.room.boardingHouse.defaultElectricityRate) }}
                      đ/kWh</strong>.</li>
                  <li>+ Giá nước: <strong>{{ formatMoney(contract.room.boardingHouse.defaultWaterRate) }} đ</strong>
                    ({{ contract.room.boardingHouse.waterBillingType === 'BY_INDEX' ? 'đ/m³ tiêu thụ thực tế' : 'đ/người/tháng' }}).
                  </li>
                </ul>
              </li>
              <li v-if="extraFees && extraFees.length > 0">
                - Các phụ phí dịch vụ định kỳ áp dụng khác:
                <ul class="list-none pl-5 mt-1 space-y-0.5">
                  <li v-for="cef in extraFees" :key="cef.id">
                    + {{ cef.extraFee.name }}: <strong>{{ formatMoney(cef.customPrice) }} đ</strong> (Tính theo {{
                      cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}).
                  </li>
                </ul>
              </li>
              <li>- Hạn thanh toán: Hóa đơn được lập vào cuối mỗi tháng. Bên B cần thanh toán đầy đủ trước ngày cuối tháng.</li>
              <li>- Phương thức thanh toán: Bằng tiền mặt trực tiếp hoặc chuyển khoản tài khoản ngân hàng của Bên A.
              </li>
            </ul>
          </div>

          <!-- Điều 4 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN CHO THUÊ (BÊN
              A)</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Bàn giao phòng và trang thiết bị đúng cam kết. Đảm bảo quyền sử dụng phòng ở độc lập, hợp pháp của
                Bên B.</li>
              <li>- Hỗ trợ làm thủ tục đăng ký tạm trú tạm vắng cho Bên B theo quy định pháp luật.</li>
              <li>- Sửa chữa kịp thời các hư hỏng lớn về cấu trúc phòng trọ (thấm dột, rò nước tường) không do lỗi của
                Bên B gây ra.</li>
            </ul>
          </div>

          <!-- Điều 5 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN THUÊ PHÒNG (BÊN
              B)</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Thanh toán đầy đủ tiền phòng và phí điện nước đúng hạn. Nếu chậm quá 05 ngày mà không được sự đồng ý
                của Bên A, Bên A có quyền đơn phương đình chỉ hợp đồng.</li>
              <li>- Giữ gìn vệ sinh chung, bảo quản tốt tài sản được bàn giao. Nếu làm hỏng hoặc mất thiết bị do lỗi chủ
                quan phải đền bù sửa chữa.</li>
              <li>- Chấp hành nghiêm chỉnh quy định an ninh trật tự, phòng cháy chữa cháy (PCCC) và luật cư trú. Không
                tàng trữ hàng cấm, vũ khí hoặc gây rối trật tự.</li>
            </ul>
          </div>

          <!-- Điều 6 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 6: ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Bên A có quyền đơn phương chấm dứt hợp đồng không hoàn cọc nếu Bên B vi phạm pháp luật, vi phạm PCCC
                hoặc chậm đóng tiền quá 05 ngày.</li>
              <li>- Bên B có quyền đơn phương chấm dứt hợp đồng nếu Bên A tăng giá tiền phòng bất hợp lý hoặc không sửa
                các hư hỏng kết cấu lớn ảnh hưởng trực tiếp đến an toàn sinh hoạt dù đã báo trước 15 ngày.</li>
            </ul>
          </div>

          <!-- Điều 7 -->
          <div>
            <h4 class="font-bold uppercase text-black dark:text-white">ĐIỀU 7: ĐIỀU KHOẢN CHUNG</h4>
            <ul class="list-none pl-4 space-y-1 mt-1">
              <li>- Hợp đồng gồm 07 điều, được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản. Mọi
                tranh chấp trước hết sẽ thương lượng giải quyết trên tinh thần hòa giải và tôn trọng lẫn nhau.</li>
            </ul>
          </div>
        </div>

        <!-- Signature section -->
        <div
          class="signature-section mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs sm:text-sm font-serif text-black dark:text-white">
          <div>
            <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN A</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-8">{{ contract.room.boardingHouse.landlord?.fullName || '' }}</div>
          </div>
          <div>
            <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN B</h5>
            <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
            <div class="font-bold mt-8">{{ contract.tenant.fullName }}</div>
          </div>
        </div>
      </div>

      <!-- Print Preview Modal -->
      <Modal v-if="showPreviewModal" title="Xem trước bản in hợp đồng" maxWidth="xl" @close="showPreviewModal = false">
        <div class="max-h-[70vh] overflow-y-auto pr-1">
          <div
            class="print-contract-container bg-white text-black p-4 border border-slate-200 rounded-xl font-serif text-xs leading-relaxed text-justify">
            <!-- National Emblem Header -->
            <div class="text-center mb-6">
              <h4 class="font-bold text-sm tracking-widest uppercase text-black">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
              <h5 class="font-semibold text-xs tracking-wide mt-1 text-black">Độc lập – Tự do – Hạnh phúc</h5>
              <div class="w-32 h-[1px] bg-black mx-auto mt-2"></div>
            </div>

            <h3 class="text-center font-bold text-lg uppercase tracking-widest my-8 text-black">
              HỢP ĐỒNG THUÊ PHÒNG TRỌ</h3>

            <!-- Contract Description intro -->
            <div class="space-y-4 text-xs leading-relaxed text-justify text-black">
              <p>Hôm nay, ngày {{ currentDay }} tháng {{ currentMonth }} năm {{ currentYear }}, tại địa chỉ dãy trọ
                chúng tôi gồm:</p>

              <!-- Bên A -->
              <div>
                <h4 class="font-bold uppercase mb-1 text-black">BÊN A: BÊN CHO THUÊ (LANDLORD)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  <div><strong>Họ và tên:</strong> {{ contract.room.boardingHouse.landlord?.fullName ||
                    '......................................................' }}</div>
                  <div><strong>Số điện thoại:</strong> {{ contract.room.boardingHouse.landlord?.phone ||
                    '......................................................' }}</div>
                  <div><strong>Số CMND/CCCD:</strong> {{ contract.room.boardingHouse.landlord?.identityCard ||
                    '......................................................' }}</div>
                  <div><strong>Ngày cấp:</strong> {{ contract.room.boardingHouse.landlord?.idCardIssueDate ?
                    formatDate(contract.room.boardingHouse.landlord.idCardIssueDate) : '.........................' }}
                  </div>
                  <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{
                    contract.room.boardingHouse.landlord?.idCardIssuePlace || '.........................' }}</div>
                  <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ contract.room.boardingHouse.address ||
                    '......................................................' }}</div>
                </div>
              </div>

              <!-- Bên B -->
              <div class="pt-2">
                <h4 class="font-bold uppercase mb-1 text-black">BÊN B: BÊN THUÊ PHÒNG (TENANT)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  <div><strong>Họ và tên:</strong> {{ contract.tenant.fullName }}</div>
                  <div><strong>Tài khoản hệ thống:</strong> {{ contract.tenant.username }}</div>
                  <div><strong>Số điện thoại:</strong> {{ contract.tenant.phone ||
                    '......................................................' }}</div>
                  <div><strong>Email:</strong> {{ contract.tenant.email ||
                    '......................................................' }}</div>
                  <div><strong>Số CMND/CCCD:</strong> {{ contract.tenant.identityCard ||
                    '......................................................' }}</div>
                  <div><strong>Ngày cấp:</strong> {{ contract.tenant.idCardIssueDate ?
                    formatDate(contract.tenant.idCardIssueDate) : '.........................' }}</div>
                  <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{ contract.tenant.idCardIssuePlace ||
                    '.........................' }}</div>
                  <div class="sm:col-span-2"><strong>Hộ khẩu thường trú:</strong> {{ contract.tenant.permanentAddress ||
                    '................................................................................................'
                  }}</div>
                  <div class="sm:col-span-2"><strong>Số người cùng ở thực tế:</strong> {{ contract.numberOfTenants }}
                    người.</div>
                </div>
              </div>

              <p class="pt-2">Hai bên cùng thống nhất các điều khoản thuê phòng trọ dưới đây:</p>

              <!-- Điều 1 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 1: THÔNG TIN PHÒNG THUÊ VÀ BÀN GIAO</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Bên A đồng ý cho Bên B thuê phòng số: <strong>Phòng {{ contract.room.roomNumber }}</strong>
                    thuộc dãy trọ: <strong>{{ contract.room.boardingHouse.name }}</strong> tại địa chỉ: <strong>{{
                      contract.room.boardingHouse.address }}</strong>.</li>
                  <li>- Mục đích sử dụng: Dùng để ở và sinh hoạt của Bên B và những người được đăng ký hợp pháp.</li>
                  <li>- Chỉ số công tơ điện bàn giao đầu kỳ: <strong>{{ contract.room.currentElectricityIndex }}
                      kWh</strong>.</li>
                  <li v-if="contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">- Chỉ số đồng hồ nước bàn giao
                    đầu kỳ: <strong>{{ contract.room.currentWaterIndex }} m³</strong>.</li>
                  <li>- Trạng thái phòng trọ: Phòng sạch sẽ, hệ thống cửa, khóa, thiết bị vệ sinh hoạt động tốt bình
                    thường.</li>
                </ul>
              </div>

              <!-- Điều 2 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 2: THỜI HẠN THUÊ VÀ ĐIỀU KHOẢN ĐẶT CỌC</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Hợp đồng bắt đầu có hiệu lực từ ngày: <strong>{{ formatDate(contract.startDate) }}</strong>.
                  </li>
                  <li>- Ngày kết thúc / hết hạn hợp đồng: <strong>{{ contract.endDate ? formatDate(contract.endDate) :
                    'Chưa thiết lập ngày kết thúc' }}</strong>.</li>
                  <li>- Tiền đặt cọc bảo đảm Bên B gửi Bên A giữ là: <strong>{{ formatMoney(contract.deposit) }}
                      đ</strong> (Bằng chữ: <em>{{ docTienBangChu(contract.deposit) }} đồng</em>). Tiền đặt cọc này sẽ
                    được hoàn trả đầy đủ cho Bên B khi chấm dứt hợp đồng thuê trọ đúng hạn, Bên B đã bàn giao phòng hoàn
                    chỉnh và thanh toán đầy đủ các khoản tiền phòng, dịch vụ còn nợ (nếu có).</li>
                  <li>- Trường hợp Bên B tự ý chấm dứt hợp đồng trước thời hạn mà không báo trước cho Bên A ít nhất 30
                    ngày, Bên B sẽ bị mất số tiền đặt cọc này.</li>
                </ul>
              </div>

              <!-- Điều 3 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 3: GIÁ THUÊ PHÒNG, ĐƠN GIÁ DỊCH VỤ VÀ PHƯƠNG THỨC THANH
                  TOÁN</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Tiền thuê phòng cố định hàng tháng: <strong>{{ formatMoney(contract.contractedRoomPrice) }}
                      đ/tháng</strong> (Bằng chữ: <em>{{ docTienBangChu(contract.contractedRoomPrice) }}
                      đồng/tháng</em>).</li>
                  <li>- Đơn giá các loại dịch vụ điện, nước tiêu thụ hằng tháng:
                    <ul class="list-none pl-5 mt-1 space-y-0.5">
                      <li>+ Giá điện: <strong>{{ formatMoney(contract.room.boardingHouse.defaultElectricityRate) }}
                          đ/kWh</strong>.</li>
                      <li>+ Giá nước: <strong>{{ formatMoney(contract.room.boardingHouse.defaultWaterRate) }} đ</strong>
                        ({{ contract.room.boardingHouse.waterBillingType === 'BY_INDEX' ? 'đ/m³ tiêu thụ thực tế' : 'đ/người/tháng' }}).
                      </li>
                    </ul>
                  </li>
                  <li v-if="extraFees && extraFees.length > 0">
                    - Các phụ phí dịch vụ định kỳ áp dụng khác:
                    <ul class="list-none pl-5 mt-1 space-y-0.5">
                      <li v-for="cef in extraFees" :key="cef.id">
                        + {{ cef.extraFee.name }}: <strong>{{ formatMoney(cef.customPrice) }} đ</strong> (Tính theo {{
                          cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}).
                      </li>
                    </ul>
                  </li>
                  <li>- Hạn thanh toán: Hóa đơn được lập vào cuối mỗi tháng. Bên B cần thanh toán đầy đủ trước ngày cuối tháng.</li>
                  <li>- Phương thức thanh toán: Bằng tiền mặt trực tiếp hoặc chuyển khoản tài khoản ngân hàng của Bên A.
                  </li>
                </ul>
              </div>

              <!-- Điều 4 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN CHO THUÊ (BÊN A)</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Bàn giao phòng và trang thiết bị đúng cam kết. Đảm bảo quyền sử dụng phòng ở độc lập, hợp pháp
                    của Bên B.</li>
                  <li>- Hỗ trợ làm thủ tục đăng ký tạm trú tạm vắng cho Bên B theo quy định pháp luật.</li>
                  <li>- Sửa chữa kịp thời các hư hỏng lớn về cấu trúc phòng trọ (thấm dột, rò nước tường) không do lỗi
                    của Bên B gây ra.</li>
                </ul>
              </div>

              <!-- Điều 5 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN THUÊ PHÒNG (BÊN B)</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Thanh toán đầy đủ tiền phòng và phí điện nước đúng hạn. Nếu chậm quá 05 ngày mà không được sự
                    đồng ý của Bên A, Bên A có quyền đơn phương đình chỉ hợp đồng.</li>
                  <li>- Giữ gìn vệ sinh chung, bảo quản tốt tài sản được bàn giao. Nếu làm hỏng hoặc mất thiết bị do lỗi
                    chủ quan phải đền bù sửa chữa.</li>
                  <li>- Chấp hành nghiêm chỉnh quy định an ninh trật tự, phòng cháy chữa cháy (PCCC) và luật cư trú.
                    Không tàng trữ hàng cấm, vũ khí hoặc gây rối trật tự.</li>
                </ul>
              </div>

              <!-- Điều 6 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 6: ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Bên A có quyền đơn phương chấm dứt hợp đồng không hoàn cọc nếu Bên B vi phạm pháp luật, vi phạm
                    PCCC hoặc chậm đóng tiền quá 05 ngày.</li>
                  <li>- Bên B có quyền đơn phương chấm dứt hợp đồng nếu Bên A tăng giá tiền phòng bất hợp lý hoặc không
                    sửa các hư hỏng kết cấu lớn ảnh hưởng trực tiếp đến an toàn sinh hoạt dù đã báo trước 15 ngày.</li>
                </ul>
              </div>

              <!-- Điều 7 -->
              <div>
                <h4 class="font-bold uppercase text-black">ĐIỀU 7: ĐIỀU KHOẢN CHUNG</h4>
                <ul class="list-none pl-4 space-y-1 mt-1">
                  <li>- Hợp đồng gồm 07 điều, được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản. Mọi
                    tranh chấp trước hết sẽ thương lượng giải quyết trên tinh thần hòa giải và tôn trọng lẫn nhau.</li>
                </ul>
              </div>
            </div>

            <!-- Signature section -->
            <div
              class="signature-section mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs font-serif text-black">
              <div>
                <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN A</h5>
                <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
                <div class="font-bold mt-8">{{ contract.room.boardingHouse.landlord?.fullName || '' }}</div>
              </div>
              <div>
                <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN B</h5>
                <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
                <div class="font-bold mt-8">{{ contract.tenant.fullName }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="showPreviewModal = false" variant="secondary">Đóng</FormButton>
          <FormButton type="button" @click="printContract" variant="primary">In hợp đồng</FormButton>
        </div>
      </Modal>

    <!-- Add Addendum Modal -->
    <Modal v-if="showAddendumModal" title="Thêm Phụ Lục Hợp Đồng" maxWidth="lg" @close="showAddendumModal = false">
      <form @submit.prevent="saveAddendum">
        <div class="mb-4">
          <FormInput
            type="date"
            label="Ngày bắt đầu hiệu lực"
            v-model="addendumForm.startDate"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá phòng (đ/tháng)"
              v-model="addendumForm.roomPrice"
              min="0"
              required
            />
          </div>
          <div>
            <FormInput
              type="number"
              label="Số người ở"
              v-model="addendumForm.numberOfTenants"
              min="1"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá điện (đ/kWh)"
              v-model="addendumForm.electricityRate"
              min="0"
              required
            />
          </div>
          <div>
            <FormInput
              type="number"
              label="Giá nước (đ)"
              v-model="addendumForm.waterRate"
              min="0"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FormSelect
              label="Cách tính tiền nước"
              v-model="addendumForm.waterBillingType"
              required
            >
              <option value="BY_INDEX">Theo chỉ số đồng hồ (đ/m³)</option>
              <option value="FIXED_PER_PERSON">Cố định theo đầu người (đ/người)</option>
            </FormSelect>
          </div>
          <div>
            <FormInput
              type="text"
              label="Ghi chú / Mô tả"
              v-model="addendumForm.description"
              placeholder="Ví dụ: Điều chỉnh giá phòng T7/2026"
            />
          </div>
        </div>

        <!-- Dịch vụ phụ phí -->
        <div class="mt-4 pt-4 border-t border-border-main">
          <h4 class="text-sm font-bold text-text-main mb-3">Phụ Phí & Dịch Vụ Áp Dụng:</h4>
          <div v-if="availableExtraFees.length === 0" class="text-xs text-text-sub italic">
            Dãy trọ này chưa cấu hình dịch vụ phụ phí.
          </div>
          <div v-else class="flex flex-col gap-2.5">
            <div v-for="(ef, index) in availableExtraFees" :key="ef.id"
              class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-xl px-4 py-3">
              <Checkbox v-model="ef.selected" :label="ef.name" />
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="ef.customPrice" min="0"
                  class="w-24 text-right border border-border-main rounded px-1.5 py-0.5 bg-card text-text-main text-xs font-bold outline-none" />
                <span class="text-xs text-text-sub font-medium">đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <FormButton type="button" @click="showAddendumModal = false" variant="secondary">Hủy</FormButton>
          <FormButton type="submit" :disabled="savingAddendum">{{ savingAddendum ? 'Đang lưu...' : 'Lưu phụ lục' }}</FormButton>
        </div>
      </form>
    </Modal>

    <!-- Print Addendum Modal -->
    <Modal v-if="showPrintAddendumModal" title="Xem trước bản in Phụ lục" maxWidth="xl" @close="showPrintAddendumModal = false">
      <div class="max-h-[70vh] overflow-y-auto pr-1">
        <div id="addendum-print-area"
          class="print-contract-container bg-white text-black p-4 sm:p-12 md:p-16 border border-slate-200 rounded-xl font-serif text-xs leading-relaxed text-justify relative">
          <!-- National Emblem Header -->
          <div class="text-center mb-6">
            <h4 class="font-bold text-sm tracking-widest uppercase text-black">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <h5 class="font-semibold text-xs tracking-wide mt-1 text-black">Độc lập – Tự do – Hạnh phúc</h5>
            <div class="w-32 h-[1px] bg-black mx-auto mt-2"></div>
          </div>

          <h3 class="text-center font-bold text-lg uppercase tracking-widest my-8 text-black">
            PHỤ LỤC HỢP ĐỒNG THUÊ PHÒNG TRỌ
          </h3>
          <div class="text-center font-semibold text-xs text-black mb-6" v-if="contract">
            (Kèm theo Hợp đồng thuê phòng số: Phòng {{ contract.room.roomNumber }} ký ngày {{ formatDate(contract.startDate) }})
          </div>

          <div class="space-y-4 text-xs leading-relaxed text-justify text-black" v-if="selectedAddendum">
            <p>Hôm nay, ngày {{ currentDay }} tháng {{ currentMonth }} năm {{ currentYear }}, tại địa chỉ dãy trọ chúng tôi gồm:</p>

            <!-- Bên A -->
            <div v-if="contract">
              <h4 class="font-bold uppercase mb-1 text-black">BÊN A: BÊN CHO THUÊ (LANDLORD)</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                <div><strong>Họ và tên:</strong> {{ contract.room.boardingHouse.landlord?.fullName || '...................................' }}</div>
                <div><strong>Số điện thoại:</strong> {{ contract.room.boardingHouse.landlord?.phone || '...................................' }}</div>
                <div><strong>Số CMND/CCCD:</strong> {{ contract.room.boardingHouse.landlord?.identityCard || '...................................' }}</div>
                <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ contract.room.boardingHouse.address || '...................................' }}</div>
              </div>
            </div>

            <!-- Bên B -->
            <div class="pt-2" v-if="contract">
              <h4 class="font-bold uppercase mb-1 text-black">BÊN B: BÊN THUÊ PHÒNG (TENANT)</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                <div><strong>Họ và tên:</strong> {{ contract.tenant.fullName }}</div>
                <div><strong>Tài khoản hệ thống:</strong> {{ contract.tenant.username }}</div>
                <div><strong>Số điện thoại:</strong> {{ contract.tenant.phone || '...................................' }}</div>
                <div><strong>Số CMND/CCCD:</strong> {{ contract.tenant.identityCard || '...................................' }}</div>
              </div>
            </div>

            <p class="pt-2">Sau khi bàn bạc và thống nhất, hai bên đồng ý ký kết phụ lục này để thay đổi, điều chỉnh một số điều khoản trong Hợp đồng thuê phòng đã ký kết, cụ thể như sau:</p>

            <!-- Các điều khoản điều chỉnh -->
            <div>
              <h4 class="font-bold uppercase text-black">CÁC NỘI DUNG ĐIỀU CHỈNH KỂ TỪ NGÀY {{ formatDate(selectedAddendum.startDate) }}</h4>
              <ul class="list-none pl-4 space-y-1.5 mt-1">
                <li>- <strong>Mô tả / Lý do điều chỉnh:</strong> {{ selectedAddendum.description || 'Điều chỉnh định kỳ giá phòng và các chi phí dịch vụ sinh hoạt.' }}</li>
                <li>- <strong>Giá thuê phòng mới:</strong> <strong>{{ formatMoney(selectedAddendum.roomPrice) }} đ/tháng</strong> (Bằng chữ: <em>{{ docTienBangChu(selectedAddendum.roomPrice) }} đồng/tháng</em>).</li>
                <li>- <strong>Số lượng người ở thực tế:</strong> <strong>{{ selectedAddendum.numberOfTenants }} người</strong>.</li>
                <li>- <strong>Đơn giá Điện mới:</strong> <strong>{{ formatMoney(selectedAddendum.electricityRate) }} đ/kWh</strong>.</li>
                <li>- <strong>Đơn giá Nước mới:</strong> <strong>{{ formatMoney(selectedAddendum.waterRate) }} đ</strong> (Tính theo {{ formatWaterBillingType(selectedAddendum.waterBillingType) }}).</li>
                <li v-if="selectedAddendum.extraFees && selectedAddendum.extraFees.length > 0">
                  - <strong>Các phụ phí dịch vụ định kỳ mới:</strong>
                  <ul class="list-none pl-5 mt-1 space-y-1">
                    <li v-for="ef in selectedAddendum.extraFees" :key="ef.id">
                      + {{ ef.extraFee.name }}: <strong>{{ formatMoney(ef.customPrice) }} đ</strong> (Tính theo {{ ef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}).
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <!-- Hiệu lực -->
            <div class="pt-2" v-if="contract">
              <h4 class="font-bold uppercase text-black">HIỆU LỰC VÀ ĐIỀU KHOẢN CHUNG</h4>
              <p>Phụ lục này là một bộ phận không thể tách rời của Hợp đồng thuê phòng số: Phòng {{ contract.room.roomNumber }} ký ngày {{ formatDate(contract.startDate) }}. Các điều khoản khác trong hợp đồng gốc không thay đổi vẫn giữ nguyên hiệu lực thi hành.</p>
              <p>Phụ lục này bắt đầu có hiệu lực kể từ ngày <strong>{{ formatDate(selectedAddendum.startDate) }}</strong>. Được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
            </div>
          </div>

          <!-- Signature section -->
          <div class="signature-section mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs font-serif text-black" v-if="contract">
            <div>
              <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN A</h5>
              <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
              <div class="font-bold mt-8">{{ contract.room.boardingHouse.landlord?.fullName || '' }}</div>
            </div>
            <div>
              <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN B</h5>
              <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
              <div class="font-bold mt-8">{{ contract.tenant.fullName }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-3 justify-end mt-4">
        <FormButton type="button" @click="showPrintAddendumModal = false" variant="secondary">Đóng</FormButton>
        <FormButton type="button" @click="printAddendum" variant="primary">In phụ lục</FormButton>
      </div>
    </Modal>

    </div>
  </div>
</template>

<script src="./ContractDetail.js"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

.print-contract-container {
  font-family: 'Lora', 'Times New Roman', Times, serif !important;
}

.signature-section {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
}

.signature-section>div {
  width: 45% !important;
  text-align: center !important;
}
</style>

<style>
/* Global Print Styles to clean up layout structures */
@media print {

  /* Completely remove layout elements, sidebars, headers, and buttons from flow */
  aside,
  header,
  .no-print,
  button,
  .fixed,
  .z-\[9999\] {
    display: none !important;
  }

  /* Reset body and wrapper elements to block layout to prevent absolute width collapse */
  html,
  body,
  #app,
  .min-h-screen,
  .flex,
  .flex-col,
  .flex-1,
  main {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    background-color: white !important;
    background: white !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  /* Suppress default browser page headers/footers */
  @page {
    size: A4;
    margin: 0;
  }

  /* Apply printed page margins inside body padding to prevent header/footer printing */
  body {
    padding: 20mm 15mm !important;
  }

  /* Expand printable container to take full width */
  .print-contract-container {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
    font-family: 'Lora', 'Times New Roman', Times, serif !important;
  }

  .print-contract-container * {
    color: black !important;
    background-color: transparent !important;
  }

  /* Ensure signatures print side-by-side in 2 columns */
  .signature-section {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    width: 100% !important;
    margin-top: 3rem !important;
    page-break-inside: avoid !important;
  }

  .signature-section>div {
    width: 45% !important;
    min-width: 45% !important;
    text-align: center !important;
    display: block !important;
  }
}
</style>
