import { defineStore } from 'pinia';
import invoiceService from '../services/invoiceService';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    loading: false,
    totalPages: 1,
    totalElements: 0,
    currentInvoiceItems: []
  }),
  actions: {
    async fetchInvoices(params) {
      this.loading = true;
      try {
        const response = await invoiceService.getAll(params);
        this.invoices = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalElements = response.data.totalElements || 0;
        return this.invoices;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchInvoiceDetail(id) {
      this.loading = true;
      try {
        const response = await invoiceService.getById(id);
        const itemsResponse = await invoiceService.getItems(id);
        this.currentInvoiceItems = itemsResponse.data || [];
        return {
          invoice: response.data,
          items: this.currentInvoiceItems
        };
      } catch (error) {
        console.error('Error fetching invoice detail:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchInvoiceItems(id) {
      try {
        const response = await invoiceService.getItems(id);
        this.currentInvoiceItems = response.data || [];
        return this.currentInvoiceItems;
      } catch (error) {
        console.error('Error fetching invoice items:', error);
        throw error;
      }
    },
    async createInvoice(data) {
      try {
        const response = await invoiceService.create(data);
        return response.data;
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    },
    async payInvoice(id, paidAmount) {
      try {
        const response = await invoiceService.pay(id, paidAmount);
        return response.data;
      } catch (error) {
        console.error('Error paying invoice:', error);
        throw error;
      }
    }
  }
});
