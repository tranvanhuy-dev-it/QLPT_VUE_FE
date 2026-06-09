<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <FormButton v-if="!status?.isExpired" @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="text-text-sub !w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <AppIcon name="coin" class="text-primary !w-5 !h-5" />
          <span>Gói Dịch Vụ & Gia Hạn</span>
        </h2>
      </div>
    </div>

    <!-- Active status card -->
    <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs mb-6">
      <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Trạng thái gói cước hiện tại</h3>
      
      <div v-if="loadingStatus" class="flex justify-center items-center py-6">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="status" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <!-- Trial Status -->
        <div class="bg-slate-50 dark:bg-slate-900/30 p-4 border border-border-main/50 rounded-xl flex flex-col justify-between">
          <div>
            <span class="text-text-sub font-semibold block mb-1">Gói dùng thử 45 ngày:</span>
            <span :class="['text-xs font-bold px-2 py-0.5 rounded', status.isTrialActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-100 text-text-sub']">
              {{ status.isTrialActive ? 'Đang kích hoạt' : 'Đã kết thúc' }}
            </span>
          </div>
          <div class="mt-4">
            <span class="text-[10px] text-text-sub block">Hạn dùng thử đến:</span>
            <strong class="text-text-main text-sm block mt-0.5">{{ formatDate(status.trialExpiredAt) }}</strong>
            <span v-if="status.isTrialActive" class="text-[10px] text-emerald-600 font-semibold block mt-1">Còn lại {{ status.trialDaysLeft }} ngày</span>
          </div>
        </div>

        <!-- Subscription Status -->
        <div class="bg-slate-50 dark:bg-slate-900/30 p-4 border border-border-main/50 rounded-xl flex flex-col justify-between">
          <div>
            <span class="text-text-sub font-semibold block mb-1">Gói dịch vụ trả phí:</span>
            <span :class="['text-xs font-bold px-2 py-0.5 rounded', status.isSubscriptionActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' : 'bg-slate-100 text-text-sub']">
              {{ status.isSubscriptionActive ? 'Đang kích hoạt' : 'Chưa đăng ký/Hết hạn' }}
            </span>
          </div>
          <div class="mt-4">
            <span class="text-[10px] text-text-sub block">Hạn gói cước:</span>
            <strong class="text-text-main text-sm block mt-0.5">
              {{ status.subscriptionExpiredAt ? formatDate(status.subscriptionExpiredAt) : 'Chưa có thông tin' }}
            </strong>
            <span v-if="status.isSubscriptionActive" class="text-[10px] text-indigo-600 font-semibold block mt-1">Còn lại {{ status.subscriptionDaysLeft }} ngày</span>
          </div>
        </div>

        <!-- Overall Expiration Block -->
        <div :class="['p-4 border rounded-xl flex flex-col justify-between', status.isExpired ? 'bg-rose-50/20 border-rose-200/50 dark:bg-rose-950/10' : 'bg-emerald-50/20 border-emerald-200/50 dark:bg-emerald-950/10']">
          <div>
            <span class="text-text-sub font-semibold block mb-1">Trạng thái sử dụng hệ thống:</span>
            <span :class="['text-xs font-extrabold px-2.5 py-0.5 rounded border uppercase', status.isExpired ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200']">
              {{ status.isExpired ? 'Hết hạn sử dụng' : 'Hoạt động bình thường' }}
            </span>
          </div>
          <div class="mt-4">
            <p v-if="status.isExpired" class="text-[10px] leading-relaxed text-rose-600 dark:text-rose-400 font-medium m-0">
              Tài khoản đã hết thời gian sử dụng. Vui lòng lựa chọn các gói dịch vụ phía dưới và thanh toán để tiếp tục sử dụng hệ thống.
            </p>
            <p v-else class="text-[10px] leading-relaxed text-emerald-600 dark:text-emerald-400 font-medium m-0">
              Bạn có thể sử dụng tất cả các chức năng bình thường. Bạn cũng có thể mua trước các gói cước để cộng dồn thêm hạn sử dụng.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing and Payment Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 columns: Gói cước & Thanh toán -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Gói cước Selector -->
        <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5">1. Chọn gói thời gian gia hạn</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 3 Months -->
            <div 
              @click="selectedMonths = 3"
              :class="['border rounded-2xl p-4 cursor-pointer transition-all duration-150 relative flex flex-col justify-between min-h-[140px]', 
                selectedMonths === 3 ? 'border-primary bg-primary/5 dark:bg-primary/5 shadow-xs ring-1 ring-primary' : 'border-border-main hover:bg-slate-50/50 dark:hover:bg-slate-900/20']"
            >
              <div>
                <span class="font-bold text-sm text-text-main block">Gói 3 Tháng</span>
                <span class="text-[10px] text-text-sub mt-1 block">Tiết kiệm, linh hoạt</span>
              </div>
              <div class="mt-4 pt-2 border-t border-border-main/20">
                <span class="text-lg font-extrabold text-primary">300.000 đ</span>
                <span class="text-[10px] text-text-sub block">(100.000đ/tháng)</span>
              </div>
            </div>

            <!-- 6 Months -->
            <div 
              @click="selectedMonths = 6"
              :class="['border rounded-2xl p-4 cursor-pointer transition-all duration-150 relative flex flex-col justify-between min-h-[140px]', 
                selectedMonths === 6 ? 'border-primary bg-primary/5 dark:bg-primary/5 shadow-xs ring-1 ring-primary' : 'border-border-main hover:bg-slate-50/50 dark:hover:bg-slate-900/20']"
            >
              <div class="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[8px] uppercase tracking-wider">Phổ biến</div>
              <div>
                <span class="font-bold text-sm text-text-main block">Gói 6 Tháng</span>
                <span class="text-[10px] text-text-sub mt-1 block">Tối ưu chi phí</span>
              </div>
              <div class="mt-4 pt-2 border-t border-border-main/20">
                <span class="text-lg font-extrabold text-primary">550.000 đ</span>
                <span class="text-[10px] text-text-sub block">(~91.000đ/tháng)</span>
              </div>
            </div>

            <!-- 12 Months -->
            <div 
              @click="selectedMonths = 12"
              :class="['border rounded-2xl p-4 cursor-pointer transition-all duration-150 relative flex flex-col justify-between min-h-[140px]', 
                selectedMonths === 12 ? 'border-primary bg-primary/5 dark:bg-primary/5 shadow-xs ring-1 ring-primary' : 'border-border-main hover:bg-slate-50/50 dark:hover:bg-slate-900/20']"
            >
              <div class="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[8px] uppercase tracking-wider">Tiết kiệm 20%</div>
              <div>
                <span class="font-bold text-sm text-text-main block">Gói 12 Tháng</span>
                <span class="text-[10px] text-text-sub mt-1 block">Dài hạn, ổn định tốt nhất</span>
              </div>
              <div class="mt-4 pt-2 border-t border-border-main/20">
                <span class="text-lg font-extrabold text-primary">1.000.000 đ</span>
                <span class="text-[10px] text-text-sub block">(~83.000đ/tháng)</span>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <FormButton 
              @click="submitUpgradeRequest" 
              :loading="submitting" 
              variant="primary"
              class="w-full sm:w-auto"
            >
              <AppIcon name="credit-card" class="!w-4 !h-4" />
              <span>Tiến hành thanh toán</span>
            </FormButton>
          </div>
        </div>

        <!-- Payment Instructions (Shown after submit) -->
        <div v-if="currentRequest" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">2. Hướng dẫn thanh toán</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- QR Code VietQR -->
            <div class="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 border border-border-main/50 rounded-2xl p-4">
              <span class="text-[10px] font-bold text-text-sub uppercase mb-2">Quét mã QR để chuyển khoản nhanh</span>
              <div class="w-48 h-48 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shrink-0 shadow-xs">
                <img :src="vietQrUrl" class="w-full h-full object-contain" alt="VietQR code" />
              </div>
              <span class="text-[9px] text-text-sub mt-2 text-center">Hỗ trợ tất cả ứng dụng ngân hàng và Ví điện tử</span>
            </div>

            <!-- Account Transfer Info -->
            <div class="space-y-3.5 text-xs">
              <div class="flex justify-between border-b border-border-main/20 pb-2">
                <span class="text-text-sub font-semibold">Ngân hàng thụ hưởng:</span>
                <span class="font-bold text-text-main">{{ adminBankInfo?.bankName || 'VietinBank' }}</span>
              </div>
              <div class="flex justify-between border-b border-border-main/20 pb-2">
                <span class="text-text-sub font-semibold">Số tài khoản:</span>
                <span class="font-bold text-primary text-[13px] select-all">{{ adminBankInfo?.bankAccount || '102882915218' }}</span>
              </div>
              <div class="flex justify-between border-b border-border-main/20 pb-2">
                <span class="text-text-sub font-semibold">Tên tài khoản:</span>
                <span class="font-bold text-text-main">{{ adminBankInfo?.accountName || 'TRAN VAN HUY' }}</span>
              </div>
              <div class="flex justify-between border-b border-border-main/20 pb-2">
                <span class="text-text-sub font-semibold">Số tiền cần chuyển:</span>
                <span class="font-extrabold text-danger text-sm">{{ formatMoney(currentRequest.amount) }} đ</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-text-sub font-semibold">Nội dung chuyển khoản (Bắt buộc nhập chính xác):</span>
                <div class="flex gap-2 items-center">
                  <span class="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded text-text-main text-center font-bold text-xs flex-1 border border-border-main select-all">
                    {{ currentRequest.paymentContent }}
                  </span>
                  <button 
                    @click="copyContent(currentRequest.paymentContent)" 
                    class="p-2 border border-border-main hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Sao chép nội dung"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-3a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5h10.5a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Zalo Notification -->
          <div class="mt-5 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-3">
            <p class="text-xs leading-relaxed text-text-sub m-0">
              💡 <strong>Sau khi chuyển khoản thành công:</strong> Hệ thống đã lưu lại yêu cầu nâng cấp của bạn. Để được duyệt và kích hoạt gói cước nhanh nhất, bạn vui lòng bấm vào nút bên dưới để nhắn tin Zalo thông báo trực tiếp cho Admin.
            </p>
            <div class="flex justify-end">
              <a 
                :href="zaloUrl" 
                target="_blank" 
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer bg-[#0068ff] hover:bg-[#0052cc] text-white shadow-xs text-center"
              >
                <AppIcon name="zalo" class="!w-4 !h-4" />
                <span>Nhắn tin Zalo báo Admin duyệt gói</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Note and Requests History -->
      <div class="flex flex-col gap-6">
        <!-- Policy & Note -->
        <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-3">Lưu ý sử dụng</h3>
          <ul class="text-xs text-text-sub space-y-2.5 pl-4 list-disc leading-relaxed">
            <li>Bạn có <strong>45 ngày đầu tiên sử dụng miễn phí đầy đủ tính năng</strong> ngay sau khi đăng ký tài khoản.</li>
            <li>Khi đăng ký mua trước, thời hạn gói cước mới sẽ được <strong>cộng dồn trực tiếp</strong> tiếp nối vào thời điểm gói hiện tại của bạn hết hạn.</li>
            <li>Hóa đơn và thông báo thanh toán sẽ được tự động hiển thị trong trang quản trị của bạn trước 3 ngày.</li>
            <li>Vui lòng chuyển khoản đúng số tiền và nội dung chuyển khoản duy nhất được hiển thị để giao dịch đối soát nhanh nhất.</li>
          </ul>
        </div>

        <!-- Zalo Quick link direct support -->
        <div class="bg-[rgba(0,102,204,0.04)] border border-primary/20 rounded-2xl p-5 flex flex-col gap-3">
          <h4 class="text-xs font-bold text-primary m-0 flex items-center gap-1.5">
            <AppIcon name="info-circle" class="!w-4 !h-4" />
            <span>Hỗ trợ trực tiếp</span>
          </h4>
          <p class="text-[11px] leading-relaxed text-text-sub m-0">
            Nếu có bất kỳ thắc mắc hoặc gặp sự cố về vấn đề thanh toán, vui lòng gửi yêu cầu hỗ trợ trực tiếp đến bộ phận kỹ thuật thông qua trang liên hệ của chúng tôi.
          </p>
          <router-link 
            to="/contact" 
            class="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
          >
            Gửi yêu cầu liên hệ hỗ trợ &rarr;
          </router-link>
        </div>
      </div>
    </div>

    <!-- Requests History list -->
    <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs mt-6">
      <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4 flex items-center justify-between">
        <span>Lịch sử yêu cầu gia hạn</span>
        <span class="text-[11px] font-semibold text-text-sub bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {{ requests.length }} yêu cầu
        </span>
      </h3>
      
      <div v-if="loadingRequests" class="flex justify-center items-center py-10">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="requests.length === 0" class="text-center py-8 text-text-sub italic text-xs">
        Chưa từng phát sinh yêu cầu nâng cấp gói nào.
      </div>
      
      <div v-else class="overflow-x-auto border border-border-main/50 rounded-xl">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60 text-text-sub font-bold uppercase text-[10px] tracking-wider">
              <th class="py-3 px-4">Gói cước</th>
              <th class="py-3 px-4">Số tiền</th>
              <th class="py-3 px-4">Nội dung chuyển</th>
              <th class="py-3 px-4">Ngày tạo</th>
              <th class="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
              <td class="py-3 px-4 font-semibold text-text-main">Gói {{ req.months }} tháng</td>
              <td class="py-3 px-4 font-bold text-text-main">{{ formatMoney(req.amount) }} đ</td>
              <td class="py-3 px-4 font-mono select-all">{{ req.paymentContent }}</td>
              <td class="py-3 px-4 text-text-sub">{{ formatDateTime(req.createdAt) }}</td>
              <td class="py-3 px-4">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border',
                  req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400' :
                  (req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400')
                ]">
                  {{ req.status === 'APPROVED' ? 'Đã duyệt' : (req.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script src="./SubscriptionUpgrade.js"></script>

<style scoped>
/* Scoped styles if needed */
</style>
