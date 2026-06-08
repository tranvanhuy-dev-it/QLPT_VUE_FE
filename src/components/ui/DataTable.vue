<template>
  <div class="w-full">
    <!-- Loading overlay (centered and standard) -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub bg-card border border-border-main/50 rounded-xl w-full">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>{{ loadingText }}</span>
    </div>
    
    <template v-else>
      <!-- Desktop Table View (lg screens and above) -->
      <div class="hidden lg:block overflow-x-auto border border-border-main/50 rounded-xl bg-card w-full">
        <table class="w-full text-sm text-left text-text-main border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
            <tr>
              <th v-for="header in headers" :key="header.key" :class="['py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider', header.align === 'right' ? 'text-right' : (header.align === 'center' ? 'text-center' : 'text-left')]">
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="item.id || index" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150" :class="{'cursor-pointer': clickable}" @click="onRowClick(item)">
              <td v-for="header in headers" :key="header.key" :class="['py-3 px-4', header.align === 'right' ? 'text-right' : (header.align === 'center' ? 'text-center' : 'text-left'), header.cellClass]">
                <slot :name="`cell(${header.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, header.key)">
                  <span v-if="header.type === 'badge'" :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', getBadgeClass(header, resolveKeyPath(item, header.key))]">
                    {{ getBadgeLabel(header, resolveKeyPath(item, header.key)) }}
                  </span>
                  <span v-else :class="header.innerClass">
                    {{ getFormattedValue(item, header) }}
                  </span>
                </slot>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td :colspan="headers.length" class="text-center text-text-sub py-12">
                {{ emptyText }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View (below lg screens) -->
      <div class="lg:hidden grid mobile-card-grid grid-cols-2 gap-3">
        <div 
          v-for="(item, index) in items" 
          :key="item.id || index" 
          class="bg-card border border-border-main/50 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-xs hover:border-primary/20 transition-all duration-150 relative min-w-0"
          :class="{'cursor-pointer active:scale-[0.99]': clickable}"
          @click="onRowClick(item)"
        >
          <!-- Top Row: Title, Subtitle and Status Badge -->
          <div class="flex flex-col gap-1.5 relative">
            <div class="flex justify-between items-start gap-2">
              <!-- Primary Title (Header 0) -->
              <h4 v-if="mobileTitleHeader" class="text-xs font-bold text-text-main truncate max-w-[70%]">
                <slot :name="`cell(${mobileTitleHeader.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, mobileTitleHeader.key)">
                  {{ getFormattedValue(item, mobileTitleHeader) }}
                </slot>
              </h4>
              <!-- Status Badge (Top Right) -->
              <div v-if="mobileBadgeHeader" class="shrink-0">
                <slot :name="`cell(${mobileBadgeHeader.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, mobileBadgeHeader.key)">
                  <span :class="['inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider', getBadgeClass(mobileBadgeHeader, resolveKeyPath(item, mobileBadgeHeader.key))]">
                    {{ getBadgeLabel(mobileBadgeHeader, resolveKeyPath(item, mobileBadgeHeader.key)) }}
                  </span>
                </slot>
              </div>
            </div>
            <!-- Secondary Subtitle (Header 1) -->
            <p v-if="mobileSubtitleHeader" class="text-[0.65rem] text-text-sub truncate font-medium">
              <slot :name="`cell(${mobileSubtitleHeader.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, mobileSubtitleHeader.key)">
                {{ getFormattedValue(item, mobileSubtitleHeader) }}
              </slot>
            </p>
          </div>

          <!-- Divider -->
          <div v-if="mobileGridHeaders.length > 0" class="border-t border-border-main/10"></div>

          <!-- Stacked details (1 column of key-value rows) -->
          <div v-if="mobileGridHeaders.length > 0" class="flex flex-col gap-2">
            <div 
              v-for="header in mobileGridHeaders" 
              :key="header.key" 
              class="flex justify-between items-center gap-2 text-[0.7rem]"
            >
              <span class="text-text-sub font-semibold shrink-0">{{ header.label }}</span>
              <span :class="['text-text-main font-bold truncate max-w-[65%] text-right', header.cellClass]">
                <slot :name="`cell(${header.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, header.key)">
                  {{ getFormattedValue(item, header) }}
                </slot>
              </span>
            </div>
          </div>

          <!-- Actions Row (Bottom Right) -->
          <div v-if="mobileActionsHeader" class="mt-auto pt-2 border-t border-border-main/10 flex justify-end items-center gap-1.5">
            <slot :name="`cell(${mobileActionsHeader.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, mobileActionsHeader.key)">
              {{ getFormattedValue(item, mobileActionsHeader) }}
            </slot>
          </div>
        </div>
        
        <!-- Empty state on mobile -->
        <div v-if="items.length === 0" class="col-span-2 text-center text-text-sub py-12 bg-card border border-border-main/50 rounded-2xl">
          {{ emptyText }}
        </div>
      </div>
    </template>

    <!-- Built-in Pagination -->
    <Pagination
      v-if="!loading && showPagination && totalPages > 0"
      :page="page"
      :totalPages="totalPages"
      :totalElements="totalElements"
      :unit="unit"
      @change-page="onChangePage"
    />
  </div>
</template>

<script src="./DataTable.js"></script>

<style scoped>
@media (max-width: 380px) {
  .mobile-card-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}
</style>
