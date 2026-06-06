import { defineStore } from 'pinia';
import contractService from '../services/contractService';

export const useContractStore = defineStore('contract', {
  state: () => ({
    contracts: [],
    activeContracts: [],
    loading: false,
    totalPages: 1,
    totalElements: 0,
    currentContract: null,
    currentExtraFees: []
  }),
  actions: {
    async fetchContracts(params) {
      this.loading = true;
      try {
        const response = await contractService.getAll(params);
        this.contracts = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalElements = response.data.totalElements || 0;
        return this.contracts;
      } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchActiveContracts() {
      try {
        const response = await contractService.getAll({ size: 100 });
        const list = response.data.content || [];
        this.activeContracts = list.filter(c => c.status === 'ACTIVE');
        return this.activeContracts;
      } catch (error) {
        console.error('Error fetching active contracts:', error);
        throw error;
      }
    },
    async fetchContractDetail(id) {
      this.loading = true;
      try {
        const [contractRes, feesRes] = await Promise.all([
          contractService.getById(id),
          contractService.getExtraFees(id)
        ]);
        this.currentContract = contractRes.data;
        this.currentExtraFees = feesRes.data || [];
        return { contract: this.currentContract, extraFees: this.currentExtraFees };
      } catch (error) {
        console.error('Error fetching contract detail:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createContract(data) {
      try {
        const response = await contractService.create(data);
        return response.data;
      } catch (error) {
        console.error('Error creating contract:', error);
        throw error;
      }
    },
    async updateContract(id, data) {
      try {
        const response = await contractService.update(id, data);
        if (this.currentContract && this.currentContract.id === id) {
          this.currentContract = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Error updating contract:', error);
        throw error;
      }
    },
    async terminateContract(id) {
      try {
        const response = await contractService.terminate(id);
        return response.data;
      } catch (error) {
        console.error('Error terminating contract:', error);
        throw error;
      }
    }
  }
});
