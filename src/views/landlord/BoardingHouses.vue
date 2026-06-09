<template>
  <div class="p-4 bg-bg-main min-h-full">
    <PageHeader title="Quản Lý Dãy Trọ" subtitle="Thêm mới và thiết lập đơn giá dịch vụ của từng khu nhà trọ"
      :icon="houseIcon" :showAdd="true" addText="Thêm" :showSearch="false" @add-click="openAddModal" />

    <!-- Grid of Boarding Houses -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải danh sách dãy trọ...</span>
    </div>

    <template v-else>
      <div v-if="boardingHouses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="house in boardingHouses" :key="house.id"
          class="bg-card border border-border-main rounded-2xl shadow-xs flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
          <!-- Card Header with gradient -->
          <div
            class="bg-gradient-to-br from-primary/10 via-sky-50 to-blue-50 dark:from-primary/20 dark:via-slate-800 dark:to-slate-900 px-5 pt-5 pb-4 border-b border-border-main/40">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <AppIcon name="building" size="md" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base text-text-main leading-tight mb-1 truncate">{{ house.name }}</h3>
                <p class="text-[11px] text-text-sub flex items-center gap-1 truncate">
                  <AppIcon name="map-pin" size="xs" />
                  {{ house.address || 'Chưa cập nhật địa chỉ' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="px-5 py-4 flex-1 flex flex-col gap-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-text-sub flex items-center gap-1.5">
                <span class="text-amber-500"></span> Giá điện
              </span>
              <span class="font-bold text-text-main">{{ formatMoney(house.defaultElectricityRate) }} đ/kWh</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-text-sub flex items-center gap-1.5">
                <span class="text-blue-500"></span> Giá nước
              </span>
              <span class="font-bold text-text-main">{{ formatMoney(house.defaultWaterRate) }} đ</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-text-sub flex items-center gap-1.5">
                Ngày chốt tiền
              </span>
              <span class="font-bold text-text-main">
                {{ house.fixedBillingDay ? `Ngày ${house.fixedBillingDay} hàng tháng` : 'Theo ngày dọn vào' }}
              </span>
            </div>

            <!-- Extra fees preview -->
            <div v-if="house.extraFees && house.extraFees.length > 0" class="pt-2 border-t border-border-main/40">
              <div class="text-[10px] text-text-sub font-semibold uppercase tracking-wider mb-1.5">Dịch vụ đi kèm</div>
              <div class="flex flex-wrap gap-1">
                <span v-for="ef in house.extraFees" :key="ef.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-text-sub">
                  {{ ef.name }}: {{ formatMoney(ef.defaultPrice) }}đ
                </span>
              </div>
            </div>

            <!-- Banking information preview -->
            <div v-if="house.bankAccountNumber" class="pt-2 border-t border-border-main/40 flex flex-col gap-1 text-[11px]">
              <div class="text-[10px] text-text-sub font-semibold uppercase tracking-wider">Tài khoản thanh toán</div>
              <span class="text-text-main font-medium">Ngân hàng: {{ house.bankName }} - {{ house.bankAccountNumber }}</span>
              <span class="text-text-sub font-medium">Chủ TK: {{ house.bankAccountName }}</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="flex border-t border-border-main/50">
            <FormButton variant="custom" @click="goToDetail(house.id)"
              class="flex-1 py-2.5 text-xs font-semibold text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 flex items-center justify-center gap-1.5 border-r border-border-main/50 rounded-none">
              <AppIcon name="eye" size="sm" />
              Chi tiết
            </FormButton>
            <FormButton variant="custom" @click="deleteHouse(house.id)"
              class="flex-1 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-150 flex items-center justify-center gap-1.5 rounded-none">
              <AppIcon name="trash" size="sm" />
              Xóa
            </FormButton>
          </div>
        </div>
      </div>

      <EmptyState v-else
        message="Bạn chưa có dãy trọ nào. Hãy nhấn nút 'Thêm Dãy Trọ Mới' ở góc trên bên phải để bắt đầu!" />
    </template>

    <!-- Add/Edit Modal -->
    <Modal v-if="showAddModal || showEditModal" :title="showEditModal ? 'Cập Nhật Dãy Trọ' : 'Thêm Dãy Trọ Mới'" maxWidth="md" @close="closeModal">
      <form @submit.prevent="saveHouse">
        <div class="mb-4">
          <FormInput
            type="text"
            label="Tên dãy trọ"
            v-model="form.name"
            placeholder="Ví dụ: Nhà trọ Green House"
            required
          />
        </div>

        <div class="mb-4">
          <FormInput
            type="text"
            label="Địa chỉ"
            v-model="form.address"
            placeholder="Nhập địa chỉ chi tiết"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá điện mặc định (đ/kWh)"
              v-model="form.defaultElectricityRate"
              min="0"
              required
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Giá nước mặc định"
              v-model="form.defaultWaterRate"
              min="0"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <FormSelect
            label="Cách tính tiền nước"
            v-model="form.waterBillingType"
            required
          >
            <option value="BY_INDEX">Tính theo chỉ số đồng hồ (tiêu thụ thực tế)</option>
            <option value="FIXED_PER_PERSON">Tính cố định theo đầu người (đ/người/tháng)</option>
          </FormSelect>
        </div>

        <div class="mb-4">
          <FormInput
            type="number"
            label="Ngày tính tiền cố định hàng tháng (1-31, để trống nếu tính theo ngày dọn vào)"
            v-model="form.fixedBillingDay"
            min="1"
            max="31"
          />
        </div>



        <!-- Cấu hình nhận thanh toán bằng QR Code -->
        <div class="mt-6 pt-4 border-t border-border-main">
          <h4 class="text-sm font-bold text-text-main mb-3">Tài Khoản Thanh Toán QR (VietQR)</h4>
          <div class="mb-4">
            <FormSelect
              label="Ngân hàng nhận"
              v-model="form.bankName"
            >
              <option value="">-- Chọn ngân hàng --</option>
              <option v-for="bank in popularBanks" :key="bank.code" :value="bank.code">
                {{ bank.name }}
              </option>
            </FormSelect>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                type="text"
                label="Số tài khoản"
                v-model="form.bankAccountNumber"
                placeholder="Nhập số tài khoản"
              />
            </div>
            <div>
              <FormInput
                type="text"
                label="Tên chủ tài khoản"
                v-model="form.bankAccountName"
                placeholder="Chữ in hoa không dấu"
              />
            </div>
          </div>
        </div>

        <!-- Cấu hình các dịch vụ / phụ phí của dãy trọ -->
        <div class="mt-6 pt-4 border-t border-border-main">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-bold text-text-main m-0">Dịch Vụ & Phụ Phí Của Dãy Trọ</h4>
            <FormButton type="button" @click="addExtraFeeRow" variant="secondary" size="sm">
              + Thêm dịch vụ
            </FormButton>
          </div>

          <div v-if="form.extraFees.length === 0"
            class="text-xs text-text-sub italic text-center py-6 border border-dashed border-border-main rounded-xl bg-slate-50/50">
            Chưa cấu hình dịch vụ nào (Ví dụ: Wifi, rác, gửi xe, vệ sinh...)
          </div>

          <div v-else class="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
            <div v-for="(ef, index) in form.extraFees" :key="index" class="flex gap-2 items-center">
              <FormInput
                type="text"
                v-model="ef.name"
                placeholder="Tên dịch vụ (ví dụ: Wifi)"
                required
                size="sm"
                class="flex-2"
              />
              <FormInput
                type="number"
                v-model="ef.defaultPrice"
                placeholder="Đơn giá"
                min="0"
                required
                size="sm"
                class="flex-1.5 w-24 text-right"
              />
              <FormSelect
                v-model="ef.unitType"
                required
                size="sm"
                class="flex-1.5 w-24"
              >
                <option value="FIXED_PER_ROOM">đ/phòng</option>
                <option value="FIXED_PER_PERSON">đ/người</option>
              </FormSelect>
              <FormButton type="button" @click="removeExtraFeeRow(index)" variant="danger" size="sm" class="!p-1.5 shrink-0">
                <AppIcon name="trash" size="sm" />
              </FormButton>
            </div>
          </div>
        </div>

        <!-- Cấu hình nội quy / quy định của dãy trọ -->
        <div class="mt-6 pt-4 border-t border-border-main">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-bold text-text-main m-0">Nội Quy Dãy Trọ</h4>
            <FormButton type="button" @click="showRuleBuilder = !showRuleBuilder" variant="secondary" size="sm" class="!px-2.5 !py-1 text-xs">
              {{ showRuleBuilder ? 'Ẩn bộ tạo mẫu' : '🪄 Tạo nhanh theo mẫu' }}
            </FormButton>
          </div>

          <!-- Quick rule template builder panel -->
          <div v-if="showRuleBuilder" class="mb-4 p-4 bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl space-y-3 text-xs">
            <div class="font-semibold text-text-main mb-2">Chọn các quy định & thiết lập thông số:</div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Curfew -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledCurfew" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Giờ giới nghiêm (Curfew)</span>
                </label>
                <div v-if="ruleTemplate.enabledCurfew" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                  <span>Khóa cổng từ</span>
                  <input type="text" v-model="ruleTemplate.curfewStart" class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                  <span>đến</span>
                  <input type="text" v-model="ruleTemplate.curfewEnd" class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                </div>
                <div v-if="ruleTemplate.enabledCurfew" class="pl-5">
                  <label class="flex items-center gap-1.5 font-normal text-text-sub cursor-pointer text-[11px]">
                    <input type="checkbox" v-model="ruleTemplate.selfUnlock" class="rounded border-border-main text-primary focus:ring-primary/25" />
                    <span>Về trễ tự mở khóa (vân tay/khóa riêng)</span>
                  </label>
                </div>
              </div>

              <!-- Drying area -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledDryingArea" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Sân phơi đồ tự do</span>
                </label>
              </div>

              <!-- Quiet hours -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledNoised" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Hạn chế tiếng ồn</span>
                </label>
                <div v-if="ruleTemplate.enabledNoised" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                  <span>Yêu cầu yên lặng sau</span>
                  <input type="text" v-model="ruleTemplate.noisedStart" class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                </div>
              </div>

              <!-- Overnight guests -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledOvernight" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Khách ở qua đêm</span>
                </label>
                <div v-if="ruleTemplate.enabledOvernight" class="flex gap-1.5 items-center pl-5 text-[11px] text-text-sub">
                  <span>Phí lưu trú</span>
                  <input type="number" v-model="ruleTemplate.overnightFee" class="w-20 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-right" />
                  <span>đ/đêm (0đ nếu miễn phí)</span>
                </div>
              </div>

              <!-- Trash hours -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledTrash" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Quy định đổ rác</span>
                </label>
                <div v-if="ruleTemplate.enabledTrash" class="flex gap-2 items-center pl-5 text-[11px] text-text-sub">
                  <span>Đổ rác trước</span>
                  <input type="text" v-model="ruleTemplate.trashTime" class="w-14 px-1.5 py-0.5 border border-border-main bg-card text-text-main rounded text-center" />
                </div>
              </div>

              <!-- Pets policy -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledPets" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Chính sách nuôi thú cưng</span>
                </label>
                <div v-if="ruleTemplate.enabledPets" class="pl-5 text-[11px]">
                  <select v-model="ruleTemplate.petsPolicy" class="px-2 py-0.5 border border-border-main bg-card text-text-main rounded outline-none focus:border-primary">
                    <option value="NO_PETS">Nghiêm cấm hoàn toàn</option>
                    <option value="ALLOWED_CONDITIONAL">Cho phép (có điều kiện)</option>
                  </select>
                </div>
              </div>

              <!-- PCCC -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledPccc" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Tuân thủ an toàn PCCC</span>
                </label>
              </div>

              <!-- Vehicles -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledVehicle" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Đỗ xe đúng quy định</span>
                </label>
              </div>

              <!-- Register temporary residence -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledRegister" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Nghĩa vụ đăng ký tạm trú</span>
                </label>
              </div>

              <!-- Illegal activities / Social evils -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledSocialEvils" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Cấm tệ nạn xã hội (ma túy, cờ bạc...)</span>
                </label>
              </div>

              <!-- Common hygiene -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledCommonHygiene" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Giữ gìn vệ sinh khu vực chung</span>
                </label>
              </div>

              <!-- Room equipments -->
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 font-medium text-text-main cursor-pointer">
                  <input type="checkbox" v-model="ruleTemplate.enabledRoomEquipments" class="rounded border-border-main text-primary focus:ring-primary/25" />
                  <span>Bảo quản vật dụng trong phòng</span>
                </label>
              </div>
            </div>

            <!-- Apply button -->
            <div class="flex justify-end pt-2 border-t border-border-main/40 mt-3">
              <FormButton type="button" @click="applyRulesTemplate" variant="primary" size="sm" class="!px-3 !py-1 text-xs">
                Áp dụng mẫu này
              </FormButton>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold text-text-main mb-1.5">Các quy tắc ra vào, vệ sinh, PCCC...</label>
            <textarea
              v-model="form.rules"
              rows="6"
              placeholder="Nhập nội quy của dãy trọ tại đây..."
              class="w-full px-3 py-2 text-xs border border-border-main bg-card text-text-main rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Lưu</FormButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script src="./BoardingHouses.js"></script>
