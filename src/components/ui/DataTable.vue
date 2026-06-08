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
      <div class="lg:hidden flex flex-col gap-4">
        <div 
          v-for="(item, index) in items" 
          :key="item.id || index" 
          class="bg-card border border-border-main/50 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:border-primary/30 transition-all duration-150"
          :class="{'cursor-pointer active:scale-[0.99]': clickable}"
          @click="onRowClick(item)"
        >
          <!-- Display each column vertically -->
          <div 
            v-for="(header, hIndex) in headers" 
            :key="header.key" 
            class="flex justify-between items-start gap-4 text-[0.8rem]"
            :class="{'pb-2.5 border-b border-border-main/10': hIndex < headers.length - 1}"
          >
            <span class="text-text-sub font-semibold shrink-0">{{ header.label }}</span>
            <span :class="['text-text-main font-semibold text-right break-words max-w-[70%]', header.cellClass]">
              <slot :name="`cell(${header.key.replace(/\./g, '_')})`" :item="item" :value="resolveKeyPath(item, header.key)">
                <span v-if="header.type === 'badge'" :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase', getBadgeClass(header, resolveKeyPath(item, header.key))]">
                  {{ getBadgeLabel(header, resolveKeyPath(item, header.key)) }}
                </span>
                <span v-else :class="header.innerClass">
                  {{ getFormattedValue(item, header) }}
                </span>
              </slot>
            </span>
          </div>
        </div>
        
        <!-- Empty state on mobile -->
        <div v-if="items.length === 0" class="text-center text-text-sub py-12 bg-card border border-border-main/50 rounded-2xl">
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
