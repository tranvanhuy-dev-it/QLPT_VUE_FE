<template>
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
      (Kèm theo Hợp đồng thuê phòng số: Phòng {{ contract.room?.roomNumber }} ký ngày {{
        formatDate(contract.startDate) }})
    </div>

    <div class="space-y-4 text-xs leading-relaxed text-justify text-black" v-if="selectedAddendum">
      <p>Hôm nay, ngày {{ currentDay }} tháng {{ currentMonth }} năm {{ currentYear }}, tại địa chỉ dãy trọ
        chúng tôi gồm:</p>

      <!-- Bên A -->
      <div v-if="contract">
        <h4 class="font-bold uppercase mb-1 text-black">BÊN A: BÊN CHO THUÊ (LANDLORD)</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
          <div><strong>Họ và tên:</strong> {{ contract.room?.boardingHouse?.landlord?.fullName ||
            '...................................' }}</div>
          <div><strong>Số điện thoại:</strong> {{ contract.room?.boardingHouse?.landlord?.phone ||
            '...................................' }}</div>
          <div><strong>Số CMND/CCCD:</strong> {{ contract.room?.boardingHouse?.landlord?.identityCard ||
            '...................................' }}</div>
          <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ contract.room?.boardingHouse?.address ||
            '...................................' }}</div>
        </div>
      </div>

      <!-- Bên B -->
      <div class="pt-2" v-if="contract">
        <h4 class="font-bold uppercase mb-1 text-black">BÊN B: BÊN THUÊ PHÒNG (TENANT)</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
          <div><strong>Họ và tên:</strong> {{ contract.tenant?.fullName }}</div>
          <div><strong>Tài khoản hệ thống:</strong> {{ contract.tenant?.username }}</div>
          <div><strong>Số điện thoại:</strong> {{ contract.tenant?.phone || '...................................'
          }}</div>
          <div><strong>Số CMND/CCCD:</strong> {{ contract.tenant?.identityCard ||
            '...................................' }}</div>
        </div>
      </div>

      <p class="pt-2">Sau khi bàn bạc và thống nhất, hai bên đồng ý ký kết phụ lục này để thay đổi, điều chỉnh
        một số điều khoản trong Hợp đồng thuê phòng đã ký kết, cụ thể như sau:</p>

      <!-- Các điều khoản điều chỉnh -->
      <div>
        <h4 class="font-bold uppercase text-black">CÁC NỘI DUNG ĐIỀU CHỈNH KỂ TỪ NGÀY {{
          formatDate(selectedAddendum.startDate) }}</h4>
        <ul class="list-none pl-4 space-y-1.5 mt-1">
          <li>- <strong>Mô tả / Lý do điều chỉnh:</strong> {{
            selectedAddendum.description || 'Điều chỉnh định kỳ giá phòng và các chi phí dịch vụ sinh hoạt.' }}
          </li>
          <li>- <strong>Giá thuê phòng mới:</strong> <strong>{{ formatMoney(selectedAddendum.roomPrice) }}
              đ/tháng</strong> (Bằng chữ: <em>{{ docTienBangChu(selectedAddendum.roomPrice) }} đồng/tháng</em>).
          </li>
          <li>- <strong>Số lượng người ở thực tế:</strong> <strong>{{ selectedAddendum.numberOfTenants }}
              người</strong>.</li>
          <li>- <strong>Đơn giá Điện mới:</strong> <strong>{{ formatMoney(selectedAddendum.electricityRate) }}
              đ/kWh</strong>.</li>
          <li>- <strong>Đơn giá Nước mới:</strong> <strong>{{ formatMoney(selectedAddendum.waterRate) }}
              đ</strong> (Tính theo {{ formatWaterBillingType(selectedAddendum.waterBillingType) }}).</li>
          <li v-if="selectedAddendum.extraFees && selectedAddendum.extraFees.length > 0">
            - <strong>Các phụ phí dịch vụ định kỳ mới:</strong>
            <ul class="list-none pl-5 mt-1 space-y-1">
              <li v-for="ef in selectedAddendum.extraFees" :key="ef.id">
                + {{ ef.extraFee?.name }}: <strong>{{ formatMoney(ef.customPrice) }} đ</strong> (Tính theo {{
                  ef.extraFee?.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}).
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Hiệu lực -->
      <div class="pt-2" v-if="contract">
        <h4 class="font-bold uppercase text-black">HIỆU LỰC VÀ ĐIỀU KHOẢN CHUNG</h4>
        <p>Phụ lục này là một bộ phận không thể tách rời của Hợp đồng thuê phòng số: Phòng {{
          contract.room?.roomNumber }} ký ngày {{ formatDate(contract.startDate) }}. Các điều khoản khác trong
          hợp đồng gốc không thay đổi vẫn giữ nguyên hiệu lực thi hành.</p>
        <p>Phụ lục này bắt đầu có hiệu lực kể từ ngày <strong>{{ formatDate(selectedAddendum.startDate)
        }}</strong>. Được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
      </div>
    </div>

    <!-- Signature section -->
    <div
      class="signature-section flex flex-row justify-between items-start w-full mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs font-serif text-black"
      v-if="contract">
      <div class="w-[45%] text-center">
        <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN A</h5>
        <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
        <div class="font-bold mt-8">{{ contract.room?.boardingHouse?.landlord?.fullName || '' }}</div>
      </div>
      <div class="w-[45%] text-center">
        <h5 class="font-bold uppercase">ĐẠI DIỆN BÊN B</h5>
        <span class="text-[10px] text-text-sub block italic mt-0.5 mb-16">(Ký và ghi rõ họ tên)</span>
        <div class="font-bold mt-8">{{ contract.tenant?.fullName }}</div>
      </div>
    </div>
  </div>
</template>

<script src="./AddendumPrint.js"></script>
