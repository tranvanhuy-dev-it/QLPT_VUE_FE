<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <FormButton @click="goBack" variant="secondary" class="!p-1.5">
            <AppIcon name="arrow-left" class="text-text-sub !w-4 !h-4" />
          </FormButton>
          <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
            <span v-if="house" class="text-primary">{{ house.name }}</span>
          </h2>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div v-if="house" class="flex flex-row items-center justify-between gap-2 w-full flex-nowrap">
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 w-fit shrink-0">
          <button type="button" @click="activeTab = 'info'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'info' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Thông tin<span class="hidden sm:inline"> chung</span>
          </button>
          <button type="button" @click="activeTab = 'rules'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'rules' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Nội quy<span class="hidden sm:inline"> dãy trọ</span>
          </button>
        </div>

        <!-- Action buttons on header -->
        <div class="flex items-center gap-1.5 shrink-0">
          <FormButton type="button" @click="handleDelete" variant="danger" size="sm"
            class="!px-2.5 !py-1.5 flex items-center gap-1.5">
            <AppIcon name="trash" class="!w-4 !h-4" />
            <span class="hidden sm:inline">Xóa dãy trọ</span>
          </FormButton>
          <FormButton type="button" @click="handleSave" variant="primary" size="sm"
            class="!px-2.5 !py-1.5 flex items-center gap-1.5">
            <AppIcon name="check-circle" class="!w-4 !h-4" />
            <span class="hidden sm:inline">Lưu thay đổi</span>
          </FormButton>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingState v-if="loading" message="Đang tải dữ liệu dãy trọ..." />

    <!-- Main Content Area -->
    <div v-else-if="house">
      <!-- Info & Rules Tab Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Form Wrapper -->
      <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs lg:col-span-2">
        <form @submit.prevent="handleSave" class="flex flex-col gap-5">

          <!-- TAB 1: THÔNG TIN CHUNG -->
          <div v-show="activeTab === 'info'" class="space-y-5">
            <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4 flex items-center gap-2">
              <AppIcon name="coin" class="text-primary !w-4 !h-4" />
              <span>Thông tin cơ bản & Giá mặc định</span>
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput type="text" label="Tên dãy trọ" v-model="form.name" placeholder="Ví dụ: Nhà trọ Green House"
                  required />
              </div>
              <div>
                <FormInput type="text" label="Địa chỉ" v-model="form.address" placeholder="Nhập địa chỉ chi tiết" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput type="number" label="Giá điện mặc định (đ/kWh)" v-model="form.defaultElectricityRate" min="0"
                  required />
              </div>
              <div>
                <FormInput type="number" label="Giá nước mặc định" v-model="form.defaultWaterRate" min="0" required />
              </div>
              <div>
                <FormSelect label="Cách tính tiền nước" v-model="form.waterBillingType" required>
                  <option value="BY_INDEX">Tính theo chỉ số đồng hồ (tiêu thụ thực tế)</option>
                  <option value="FIXED_PER_PERSON">Tính cố định theo đầu người (đ/người/tháng)</option>
                </FormSelect>
              </div>
              <div>
                <FormInput type="number" label="Ngày tính tiền cố định (1-31, để trống nếu tính theo ngày dọn vào)"
                  v-model="form.fixedBillingDay" min="1" max="31" />
              </div>
            </div>

            <!-- VietQR Settings -->
            <div class="pt-4 border-t border-border-main">
              <h4 class="text-xs font-bold text-text-main uppercase tracking-wider mb-3">💳 Tài Khoản Nhận Thanh Toán
                (VietQR)</h4>
              <div class="mb-4">
                <FormSelect label="Ngân hàng nhận" v-model="form.bankName">
                  <option value="">-- Chọn ngân hàng --</option>
                  <option v-for="bank in popularBanks" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </FormSelect>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput type="text" label="Số tài khoản" v-model="form.bankAccountNumber"
                    placeholder="Nhập số tài khoản" />
                </div>
                <div>
                  <FormInput type="text" label="Tên chủ tài khoản" v-model="form.bankAccountName"
                    placeholder="Chữ in hoa không dấu" />
                </div>
              </div>
            </div>

            <!-- Extra fees / Services -->
            <div class="pt-4 border-t border-border-main">
              <div class="flex justify-between items-center mb-3">
                <h4 class="text-xs font-bold text-text-main uppercase tracking-wider m-0">🔌 Dịch Vụ & Phụ Phí Định Kỳ
                </h4>
                <FormButton type="button" @click="addExtraFeeRow" variant="secondary" size="sm"
                  class="!px-2.5 !py-1 text-xs">
                  + Thêm dịch vụ
                </FormButton>
              </div>

              <div v-if="form.extraFees.length === 0"
                class="text-xs text-text-sub italic text-center py-6 border border-dashed border-border-main rounded-xl bg-slate-50/50">
                Chưa cấu hình dịch vụ nào (Ví dụ: Wifi, rác, gửi xe, vệ sinh...)
              </div>

              <div v-else class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                <div v-for="(ef, index) in form.extraFees" :key="index" class="flex gap-2 items-center">
                  <FormInput type="text" v-model="ef.name" placeholder="Tên dịch vụ (ví dụ: Wifi)" required size="sm"
                    class="flex-2" />
                  <FormInput type="number" v-model="ef.defaultPrice" placeholder="Đơn giá" min="0" required size="sm"
                    class="flex-1.5 w-24 text-right" />
                  <FormSelect v-model="ef.unitType" required size="sm" class="flex-1.5 w-24">
                    <option value="FIXED_PER_ROOM">đ/phòng</option>
                    <option value="FIXED_PER_PERSON">đ/người</option>
                  </FormSelect>
                  <FormButton type="button" @click="removeExtraFeeRow(index)" variant="danger" size="sm"
                    class="!p-1.5 shrink-0">
                    <AppIcon name="trash" size="sm" />
                  </FormButton>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: NỘI QUY DÃY TRỌ -->
          <div v-show="activeTab === 'rules'" class="space-y-5">
            <div class="flex justify-between items-center border-b border-border-main pb-3 mb-4">
              <h3 class="text-sm font-bold text-text-main m-0 flex items-center gap-2">
                <AppIcon name="contract" class="text-primary !w-4 !h-4" />
                <span>Quy định & Nội quy lưu trú</span>
              </h3>
              <FormButton type="button" @click="showRuleBuilder = !showRuleBuilder" variant="secondary" size="sm"
                class="!px-2.5 !py-1 text-xs">
                {{ showRuleBuilder ? 'Ẩn bộ tạo mẫu' : '🪄 Tạo nhanh theo mẫu' }}
              </FormButton>
            </div>

            <!-- Quick rule template builder panel -->
            <div v-if="showRuleBuilder"
              class="mb-4 p-4 bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl space-y-3 text-xs">
              <div class="font-semibold text-text-main mb-2">Chọn các quy định & thiết lập thông số:</div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Curfew -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledCurfew"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Giờ giới nghiêm (Curfew)</span>
                  </label>
                  <div v-if="ruleTemplate.enabledCurfew" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                    <span>Khóa cổng từ</span>
                    <input type="text" v-model="ruleTemplate.curfewStart"
                      class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                    <span>đến</span>
                    <input type="text" v-model="ruleTemplate.curfewEnd"
                      class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                  </div>
                  <div v-if="ruleTemplate.enabledCurfew" class="pl-5">
                    <label class="flex items-center gap-1.5 font-normal text-text-sub cursor-pointer text-[11px]">
                      <input type="checkbox" v-model="ruleTemplate.selfUnlock"
                        class="rounded border-border-main text-primary focus:ring-primary/25" />
                      <span>Về trễ tự mở khóa (vân tay/khóa riêng)</span>
                    </label>
                  </div>
                </div>

                <!-- Drying area -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledDryingArea"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Sân phơi đồ tự do</span>
                  </label>
                </div>

                <!-- Quiet hours -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledNoised"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Hạn chế tiếng ồn</span>
                  </label>
                  <div v-if="ruleTemplate.enabledNoised" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                    <span>Yêu cầu yên lặng sau</span>
                    <input type="text" v-model="ruleTemplate.noisedStart"
                      class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                  </div>
                </div>

                <!-- Overnight guests -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledOvernight"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Khách ở qua đêm</span>
                  </label>
                  <div v-if="ruleTemplate.enabledOvernight"
                    class="flex gap-1.5 items-center pl-5 text-[11px] text-text-sub">
                    <span>Phí lưu trú</span>
                    <input type="number" v-model="ruleTemplate.overnightFee"
                      class="w-20 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-right" />
                    <span>đ/đêm</span>
                  </div>
                </div>

                <!-- Trash hours -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledTrash"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Quy định đổ rác</span>
                  </label>
                  <div v-if="ruleTemplate.enabledTrash" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                    <span>Đổ rác trước</span>
                    <input type="text" v-model="ruleTemplate.trashTime"
                      class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                  </div>
                </div>

                <!-- Pets policy -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledPets"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Chính sách nuôi thú cưng</span>
                  </label>
                  <div v-if="ruleTemplate.enabledPets" class="pl-5 text-[11px]">
                    <select v-model="ruleTemplate.petsPolicy"
                      class="px-2 py-0.5 border border-border-main bg-card text-text-main rounded outline-none focus:border-primary">
                      <option value="NO_PETS">Nghiêm cấm hoàn toàn</option>
                      <option value="ALLOWED_CONDITIONAL">Cho phép (có điều kiện)</option>
                    </select>
                  </div>
                </div>

                <!-- PCCC -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledPccc"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Tuân thủ an toàn PCCC</span>
                  </label>
                </div>

                <!-- Vehicles -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledVehicle"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Đỗ xe đúng quy định</span>
                  </label>
                </div>

                <!-- Register temporary residence -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledRegister"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Nghĩa vụ đăng ký tạm trú</span>
                  </label>
                </div>

                <!-- Social evils -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledSocialEvils"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Cấm tệ nạn xã hội (ma túy, cờ bạc...)</span>
                  </label>
                </div>

                <!-- Common hygiene -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledCommonHygiene"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Giữ gìn vệ sinh khu vực chung</span>
                  </label>
                </div>

                <!-- Room equipments -->
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                    <input type="checkbox" v-model="ruleTemplate.enabledRoomEquipments"
                      class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Bảo quản vật dụng trong phòng</span>
                  </label>
                </div>
              </div>

              <!-- Apply button -->
              <div class="flex justify-end pt-2 border-t border-border-main/40 mt-3">
                <FormButton type="button" @click="applyRulesTemplate" variant="primary" size="sm"
                  class="!px-3 !py-1 text-xs">
                  Áp dụng mẫu này
                </FormButton>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-xs font-semibold text-text-main mb-1.5">Nội quy chi tiết (Dạng văn bản):</label>
              <textarea v-model="form.rules" rows="12" placeholder="Nhập nội quy của dãy trọ tại đây..."
                class="w-full px-3 py-2.5 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed font-mono"></textarea>
            </div>
          </div>
        </form>
      </div>

      <!-- Right: Stats & Summary -->
      <div class="flex flex-col gap-6">
        <!-- Quick Info Summary -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Thông tin chung</h3>
          <div class="flex flex-col gap-4 text-xs">
            <div class="flex justify-between items-center py-1 border-b border-border-main/40">
              <span class="text-text-sub">Tên dãy trọ:</span>
              <span class="font-bold text-text-main">{{ house.name }}</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-border-main/40">
              <span class="text-text-sub">Địa chỉ:</span>
              <span class="font-semibold text-text-main text-right">{{ house.address || '---' }}</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-border-main/40">
              <span class="text-text-sub">Đơn giá điện:</span>
              <span class="font-bold text-text-main text-primary">{{ formatMoney(house.defaultElectricityRate) }}
                đ/kWh</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-border-main/40">
              <span class="text-text-sub">Đơn giá nước:</span>
              <span class="font-bold text-text-main text-primary">{{ formatMoney(house.defaultWaterRate) }} đ ({{
                house.waterBillingType === 'BY_INDEX' ? 'Đồng hồ' : 'Đầu người' }})</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-border-main/40">
              <span class="text-text-sub">Ngày chốt tiền:</span>
              <span class="font-bold text-text-main text-primary">
                {{ house.fixedBillingDay ? `Ngày ${house.fixedBillingDay} hàng tháng` : 'Theo ngày dọn vào' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Tip -->
        <div class="bg-[rgba(0,102,204,0.04)] border border-primary/20 rounded-2xl p-5">
          <h4 class="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <AppIcon name="info-circle" class="!w-4 !h-4" />
            <span>VietQR & Nội quy</span>
          </h4>
          <p class="text-[11px] leading-relaxed text-text-sub">
            Việc thiết lập đầy đủ tài khoản ngân hàng và các quy định nội quy rõ ràng sẽ giúp tối ưu hóa trải nghiệm tự
            động hóa dịch vụ cho khách thuê của bạn. Khách thuê sẽ nhìn thấy mã QR VietQR khi nhận hóa đơn và xem được
            bảng nội quy dãy trọ này tại trang riêng của họ.
          </p>
        </div>
      </div>
      </div> <!-- Closes Info & Rules Tab Layout -->
    </div> <!-- Closes house container -->

    <!-- CONFIRM MODAL -->
    <ConfirmModal :show="confirmModal.show" :title="confirmModal.title" :message="confirmModal.message"
      :type="confirmModal.type" :confirm-text="confirmModal.confirmText" :cancel-text="confirmModal.cancelText"
      :show-cancel="confirmModal.showCancel" @confirm="onConfirmModal" @cancel="closeConfirmModal" />
  </div>
</template>

<script src="./BoardingHouseDetail.js"></script>
