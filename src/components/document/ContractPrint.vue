<template>
  <div id="contract-print-area"
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
          <div><strong>Họ và tên:</strong> {{ contract.room?.boardingHouse?.landlord?.fullName ||
            '......................................................' }}</div>
          <div><strong>Số điện thoại:</strong> {{ contract.room?.boardingHouse?.landlord?.phone ||
            '......................................................' }}</div>
          <div><strong>Số CMND/CCCD:</strong> {{ contract.room?.boardingHouse?.landlord?.identityCard ||
            '......................................................' }}</div>
          <div><strong>Ngày cấp:</strong> {{ contract.room?.boardingHouse?.landlord?.idCardIssueDate ?
            formatDate(contract.room.boardingHouse.landlord.idCardIssueDate) : '.........................' }}</div>
          <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{
            contract.room?.boardingHouse?.landlord?.idCardIssuePlace || '.........................' }}</div>
          <div class="sm:col-span-2"><strong>Địa chỉ dãy trọ:</strong> {{ contract.room?.boardingHouse?.address ||
            '......................................................' }}</div>
        </div>
      </div>

      <!-- Bên B -->
      <div class="pt-2">
        <h4 class="font-bold uppercase mb-1 text-black dark:text-white">BÊN B: BÊN THUÊ PHÒNG (TENANT)</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
          <div><strong>Họ và tên:</strong> {{ contract.tenant?.fullName }}</div>
          <div><strong>Tài khoản hệ thống:</strong> {{ contract.tenant?.username }}</div>
          <div><strong>Số điện thoại:</strong> {{ contract.tenant?.phone ||
            '......................................................' }}</div>
          <div><strong>Email:</strong> {{ contract.tenant?.email ||
            '......................................................' }}</div>
          <div><strong>Số CMND/CCCD:</strong> {{ contract.tenant?.identityCard ||
            '......................................................' }}</div>
          <div><strong>Ngày cấp:</strong> {{ contract.tenant?.idCardIssueDate ?
            formatDate(contract.tenant.idCardIssueDate) : '.........................' }}</div>
          <div class="sm:col-span-2"><strong>Nơi cấp:</strong> {{ contract.tenant?.idCardIssuePlace ||
            '.........................' }}</div>
          <div class="sm:col-span-2"><strong>Hộ khẩu thường trú:</strong> {{ contract.tenant?.permanentAddress ||
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
          <li>- Bên A đồng ý cho Bên B thuê phòng số: <strong>Phòng {{ contract.room?.roomNumber }}</strong> thuộc
            dãy trọ: <strong>{{ contract.room?.boardingHouse?.name }}</strong> tại địa chỉ: <strong>{{
              contract.room?.boardingHouse?.address }}</strong>.</li>
          <li>- Mục đích sử dụng: Dùng để ở và sinh hoạt của Bên B và những người được đăng ký hợp pháp.</li>
          <li>- Chỉ số công tơ điện bàn giao đầu kỳ: <strong>{{ contract.room?.currentElectricityIndex }}
              kWh</strong>.</li>
          <li v-if="contract.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">- Chỉ số đồng hồ nước bàn giao đầu
            kỳ: <strong>{{ contract.room?.currentWaterIndex }} m³</strong>.</li>
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
              <li>+ Giá điện: <strong>{{ formatMoney(contract.room?.boardingHouse?.defaultElectricityRate) }}
                  đ/kWh</strong>.</li>
              <li>+ Giá nước: <strong>{{ formatMoney(contract.room?.boardingHouse?.defaultWaterRate) }} đ</strong>
                ({{ contract.room?.boardingHouse?.waterBillingType === 'BY_INDEX' ? 'đ/m³ tiêu thụ thực tế' : 'đ/người/tháng' }}).
              </li>
            </ul>
          </li>
          <li v-if="extraFees && extraFees.length > 0">
            - Các phụ phí dịch vụ định kỳ áp dụng khác:
            <ul class="list-none pl-5 mt-1 space-y-0.5">
              <li v-for="cef in extraFees" :key="cef.id">
                + {{ cef.extraFee?.name }}: <strong>{{ formatMoney(cef.customPrice) }} đ</strong> (Tính theo {{
                  cef.extraFee?.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}).
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
      class="signature-section flex flex-row justify-between items-start w-full mt-12 pb-8 pt-4 border-t border-dashed border-border-main/50 text-xs sm:text-sm font-serif text-black dark:text-white">
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

<script src="./ContractPrint.js"></script>
