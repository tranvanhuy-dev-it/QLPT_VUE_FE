import { defineStore } from 'pinia';
import tenantService from '../services/tenantService';

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenants: [],
    loading: false,
    totalPages: 1,
    totalElements: 0
  }),
  actions: {
    async fetchTenants(params) {
      this.loading = true;
      try {
        const response = await tenantService.getAll(params);
        this.tenants = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalElements = response.data.totalElements || 0;
        return this.tenants;
      } catch (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createTenantAccount(data) {
      try {
        const response = await tenantService.create(data);
        return response.data;
      } catch (error) {
        console.error('Error creating tenant account:', error);
        throw error;
      }
    },
    async toggleTenantStatus(id) {
      try {
        const response = await tenantService.toggleStatus(id);
        const index = this.tenants.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tenants[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Error toggling tenant status:', error);
        throw error;
      }
    }
  }
});
