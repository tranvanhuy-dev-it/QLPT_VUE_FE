<template>
  <div class="p-4 bg-bg-main min-h-full relative">
    
    <!-- TOAST ALERT BANNER -->
    <transition name="toast-fade">
      <div v-if="toast.show" 
        class="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold"
        :class="toast.type === 'success' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-300' 
          : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-300'">
        <svg v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- LOADING SCREEN -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-medium">Đang chuẩn bị dữ liệu thuế...</span>
    </div>

    <!-- MAIN VIEW -->
    <template v-else>
      <!-- HEADER BANNER -->
      <div class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-sky-500 text-white p-4 md:p-6 rounded-2xl mb-4 shadow-md shadow-indigo-500/20">
        <div class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none"></div>
        <div class="relative z-10 flex-1">
          <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">Quyết toán · Pháp lý</span>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Khai báo Thuế & Doanh thu</h1>
          <p class="text-sm opacity-85 mt-1">Quản lý cấu hình thuế suất, xuất báo cáo Excel và lập tờ khai gửi cơ quan quản lý</p>
        </div>
        <div class="relative z-10 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full font-semibold whitespace-nowrap mt-4 md:mt-0">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ currentDate }}
        </div>
      </div>

      <!-- ROW: CONFIG & FILTERS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-start">
        
        <!-- FILTER COLUMN -->
        <div class="lg:col-span-2 bg-card border border-border-main rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <h3 class="text-sm font-bold text-text-main">Thời Gian & Dãy Trọ Kê Khai</h3>
            </div>
            <!-- Settings toggle -->
            <button @click="showConfig = !showConfig" 
              class="text-xs flex items-center gap-1 font-semibold py-1.5 px-3 rounded-lg border border-border-main hover:bg-slate-50 dark:hover:bg-slate-800 text-text-sub transition">
              <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': savingConfig }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span>Cấu hình biểu thuế</span>
            </button>
          </div>

          <!-- Filters Form -->
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div class="text-xs">
              <label class="block text-text-sub font-semibold mb-1">Dãy nhà trọ</label>
              <FormSelect v-model="selectedBoardingHouseId" size="sm" class="!w-full">
                <option value="all">Tất cả dãy trọ</option>
                <option v-for="bh in allBoardingHouses" :key="bh.id" :value="bh.id">{{ bh.name }}</option>
              </FormSelect>
            </div>
            
            <div class="text-xs">
              <label class="block text-text-sub font-semibold mb-1">Năm báo cáo</label>
              <FormSelect v-model="year" size="sm" class="!w-full">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </FormSelect>
            </div>

            <div class="text-xs">
              <label class="block text-text-sub font-semibold mb-1">Kỳ khai báo</label>
              <FormSelect v-model="periodType" size="sm" class="!w-full">
                <option value="MONTH">Theo Tháng</option>
                <option value="QUARTER">Theo Quý</option>
                <option value="YEAR">Theo Năm</option>
              </FormSelect>
            </div>

            <div class="text-xs" v-if="periodType !== 'YEAR'">
              <label class="block text-text-sub font-semibold mb-1">Giá trị kỳ</label>
              <FormSelect v-model="periodValue" size="sm" class="!w-full">
                <template v-if="periodType === 'MONTH'">
                  <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
                </template>
                <template v-else-if="periodType === 'QUARTER'">
                  <option v-for="q in quarters" :key="q.value" :value="q.value">{{ q.label }}</option>
                </template>
              </FormSelect>
            </div>
          </div>
        </div>

        <!-- COLLAPSIBLE DYNAMIC TAX CONFIG PANEL -->
        <div v-if="showConfig" class="bg-card border border-primary/30 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 class="text-xs font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Cấu Hình Biểu Thuế Động
          </h4>
          
          <div class="flex flex-col gap-2">
            <FormInput type="number" label="Ngưỡng chịu thuế năm (VNĐ)" v-model.number="config.annualThreshold" class="!mb-0" />
            <div class="grid grid-cols-2 gap-2">
              <FormInput type="number" step="0.1" label="Thuế suất GTGT (%)" v-model.number="config.vatRate" class="!mb-0" />
              <FormInput type="number" step="0.1" label="Thuế suất TNCN (%)" v-model.number="config.pitRate" class="!mb-0" />
            </div>
            
            <div class="flex gap-2 mt-2 pt-2 border-t border-border-main/50">
              <button @click="saveConfig" :disabled="savingConfig"
                class="flex-1 py-1.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition text-center disabled:opacity-50">
                Lưu cấu hình
              </button>
              <button @click="showConfig = false"
                class="py-1.5 px-3 border border-border-main text-text-sub text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PREVIEW TAX CARDS -->
      <div v-if="preview" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        
        <!-- CARD 1: COLLECTED REVENUE -->
        <div class="bg-card border border-border-main border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Doanh thu thực thu kỳ lọc</span>
            <h2 class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-1">{{ formatMoney(preview.totalRevenue) }} đ</h2>
            <span class="text-[9px] text-text-sub mt-0.5 block font-medium">Chỉ tính hóa đơn Đã thanh toán</span>
          </div>
        </div>

        <!-- CARD 2: ANNUAL THRESHOLD STATUS -->
        <div class="bg-card border border-border-main border-l-4 rounded-xl p-4 shadow-xs flex flex-col justify-between"
          :class="preview.isTaxable ? 'border-l-indigo-500' : 'border-l-amber-500'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="preview.isTaxable ? 'bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600' : 'bg-amber-50 dark:bg-amber-950/35 text-amber-600'">
              <svg class="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Tiến trình doanh thu năm {{ year }}</span>
              <p class="text-xs font-black text-text-main mt-0.5 truncate">{{ formatMoney(preview.annualRevenueSoFar) }} / {{ formatMoney(preview.annualThreshold) }} đ</p>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="mt-2">
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                :class="preview.isTaxable ? 'bg-indigo-500' : 'bg-amber-500'"
                :style="{ width: Math.min((preview.annualRevenueSoFar / preview.annualThreshold) * 100, 100) + '%' }"></div>
            </div>
            <div class="flex justify-between items-center text-[9px] text-text-sub font-semibold mt-1">
              <span>{{ Math.round((preview.annualRevenueSoFar / preview.annualThreshold) * 100) }}%</span>
              <span :class="preview.isTaxable ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'">
                {{ preview.isTaxable ? 'Chịu thuế' : 'Chưa chịu thuế' }}
              </span>
            </div>
          </div>
        </div>

        <!-- CARD 3: TOTAL TAX PAYABLE -->
        <div class="bg-card border border-border-main border-l-4 rounded-xl p-4 shadow-xs flex items-center gap-3"
          :class="preview.totalTaxAmount > 0 ? 'border-l-rose-500' : 'border-l-slate-400'">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="preview.totalTaxAmount > 0 ? 'bg-rose-50 dark:bg-rose-950/35 text-rose-500' : 'bg-slate-50 dark:bg-slate-900/35 text-text-sub'">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[0.65rem] text-text-sub font-bold uppercase tracking-wider">Tổng tiền thuế tạm tính</span>
            <h2 class="text-xl font-extrabold leading-none mt-1" 
              :class="preview.totalTaxAmount > 0 ? 'text-rose-500' : 'text-text-sub'">
              {{ formatMoney(preview.totalTaxAmount) }} đ
            </h2>
            <span class="text-[9px] text-text-sub mt-0.5 block font-medium" v-if="preview.totalTaxAmount > 0">
              GTGT: {{ formatMoney(preview.vatAmount) }}đ ({{ config.vatRate }}%) · TNCN: {{ formatMoney(preview.pitAmount) }}đ ({{ config.pitRate }}%)
            </span>
            <span class="text-[9px] text-emerald-600 font-bold mt-0.5 block" v-else>
              Miễn thuế (Chưa đạt ngưỡng đóng thuế)
            </span>
          </div>
        </div>

      </div>

      <!-- MAIN ACTIONS BAR -->
      <div class="bg-card border border-border-main rounded-2xl p-4 mb-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h4 class="text-xs font-bold text-text-main">Xuất Báo Cáo & Khai Báo Điện Tử</h4>
          <p class="text-[11px] text-text-sub mt-0.5">Xuất file Excel đối chiếu thông tin nợ phòng, điện, nước và nộp hồ sơ kê khai trực tuyến.</p>
        </div>
        
        <div class="flex gap-2 w-full sm:w-auto shrink-0">
          <button @click="handleExportExcel" :disabled="calculating || exportingExcel"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-50">
            <svg v-if="exportingExcel" class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0"></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ exportingExcel ? 'Đang xuất...' : 'Xuất Excel' }}</span>
          </button>

          <!-- Button Declare Tax -->
          <button @click="submitDeclaration" :disabled="calculating || submitting"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark shadow-sm transition disabled:opacity-50">
            <svg v-if="submitting" class="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin shrink-0"></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Nộp tờ khai thuế
          </button>
        </div>
      </div>

      <!-- DECLARATION HISTORY SECTION -->
      <div class="bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden mb-4">
        <div class="px-4 py-3 border-b border-border-main bg-bg-main/40 flex items-center gap-2">
          <svg class="w-4 h-4 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-xs font-bold text-text-main uppercase tracking-wider">Lịch Sử Nộp Tờ Khai Thuế</span>
        </div>

        <!-- Empty State -->
        <div v-if="declarations.length === 0" class="py-16 text-center text-text-sub text-sm italic">
          Chưa có hồ sơ tờ khai thuế nào được nộp trực tuyến trước đó.
        </div>

        <!-- History Table (Desktop lg+) -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Mã giao dịch</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Kỳ báo cáo</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Dãy trọ</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Doanh thu kỳ</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Thuế GTGT</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Thuế TNCN</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Tổng thuế</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Ngày nộp</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="decl in declarations" :key="decl.id"
                class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                <td class="py-3 px-4 font-mono font-bold text-primary">{{ decl.declarationNumber }}</td>
                <td class="py-3 px-4 font-semibold text-text-main">{{ decl.periodLabel }}</td>
                <td class="py-3 px-4 text-text-sub">{{ decl.boardingHouseName }}</td>
                <td class="py-3 px-4 text-right font-medium text-text-main">{{ formatMoney(decl.totalRevenue) }} đ</td>
                <td class="py-3 px-4 text-right text-text-sub">{{ formatMoney(decl.vatAmount) }} đ</td>
                <td class="py-3 px-4 text-right text-text-sub">{{ formatMoney(decl.pitAmount) }} đ</td>
                <td class="py-3 px-4 text-right font-bold" :class="decl.totalTaxAmount > 0 ? 'text-rose-500' : 'text-emerald-600'">
                  {{ formatMoney(decl.totalTaxAmount) }} đ
                </td>
                <td class="py-3 px-4 text-text-sub">{{ formatDate(decl.submittedDate) }}</td>
                <td class="py-3 px-4 text-center">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    Đã duyệt
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History Cards (Mobile < lg) -->
        <div v-if="declarations.length > 0" class="lg:hidden flex flex-col divide-y divide-border-main/50">
          <div v-for="decl in declarations" :key="decl.id" class="p-4 flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-black text-text-main text-sm">{{ decl.periodLabel }}</p>
                <p class="text-[10px] text-text-sub font-mono">{{ decl.declarationNumber }}</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                Đã duyệt
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs border-t border-border-main/30 pt-2 mt-1">
              <div>
                <p class="text-[10px] text-text-sub">Dãy trọ</p>
                <p class="font-semibold text-text-main">{{ decl.boardingHouseName }}</p>
              </div>
              <div>
                <p class="text-[10px] text-text-sub">Ngày nộp</p>
                <p class="font-semibold text-text-main">{{ formatDate(decl.submittedDate) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-text-sub">Doanh thu</p>
                <p class="font-semibold text-text-main">{{ formatMoney(decl.totalRevenue) }} đ</p>
              </div>
              <div>
                <p class="text-[10px] text-text-sub">Tổng tiền thuế</p>
                <p class="font-bold" :class="decl.totalTaxAmount > 0 ? 'text-rose-500' : 'text-emerald-600'">
                  {{ formatMoney(decl.totalTaxAmount) }} đ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- RECEIPT MODAL (ELECTRONIC RECEIPT) -->
      <transition name="modal-fade">
        <div v-if="showReceipt && receipt" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div class="w-full max-w-lg bg-card border border-border-main rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            
            <!-- Success Mark Animation Header -->
            <div class="flex flex-col items-center text-center gap-2 mb-2">
              <div class="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-lg font-black text-text-main uppercase tracking-wide">Biên Lai Tiếp Nhận Tờ Khai Thuế</h2>
              <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 shadow-2xs">
                Đã Duyệt Tự Động
              </span>
            </div>

            <!-- Receipt Content (Invoice style document) -->
            <div class="bg-bg-main/50 border border-border-main rounded-xl p-4 text-xs font-medium flex flex-col gap-3 relative shadow-inner">
              <div class="absolute -right-3 top-2 rotate-12 opacity-10 font-bold text-3xl text-emerald-600 uppercase border-2 border-dashed border-emerald-600 p-1 rounded">Đã Nộp</div>
              
              <div class="flex justify-between items-center pb-2 border-b border-border-main/50">
                <span class="text-text-sub">Mã giao dịch điện tử:</span>
                <span class="font-mono font-bold text-primary">{{ receipt.declarationNumber }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-sub">Người nộp thuế:</span>
                <span class="font-bold text-text-main">{{ receipt.boardingHouseName }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-sub">Thời gian kê khai:</span>
                <span class="font-bold text-text-main">{{ receipt.periodLabel }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-sub">Tổng thực thu ghi nhận:</span>
                <span class="font-bold text-text-main">{{ formatMoney(receipt.totalRevenue) }} VNĐ</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-sub">Thuế GTGT (VAT):</span>
                <span class="font-bold text-text-main">{{ formatMoney(receipt.vatAmount) }} VNĐ</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-sub">Thuế TNCN (PIT):</span>
                <span class="font-bold text-text-main">{{ formatMoney(receipt.pitAmount) }} VNĐ</span>
              </div>

              <div class="flex justify-between items-center pt-2 border-t border-border-main/50">
                <span class="text-xs font-bold text-text-main uppercase">Tổng số tiền thuế phải nộp:</span>
                <span class="text-sm font-black text-rose-500">{{ formatMoney(receipt.totalTaxAmount) }} VNĐ</span>
              </div>

              <div class="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-border-main/30 text-[10px] text-text-sub italic leading-relaxed">
                <strong>Phản hồi từ Cơ quan Thuế:</strong><br>
                {{ receipt.taxAuthorityResponse }}
              </div>
            </div>

            <!-- Receipt Actions -->
            <div class="flex gap-2.5 mt-2">
              <button @click="showReceipt = false"
                class="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark shadow-md transition text-center select-none cursor-pointer">
                Đóng biên lai
              </button>
            </div>
            
          </div>
        </div>
      </transition>

    </template>
  </div>
</template>

<script src="./TaxDeclaration.js"></script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
