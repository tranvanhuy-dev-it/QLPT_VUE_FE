import { defineStore } from 'pinia';
import boardingHouseService from '../services/boardingHouseService';

export const useBoardingHouseStore = defineStore('boardingHouse', {
  state: () => ({
    boardingHouses: [],
    loading: false,
  }),
  actions: {
    async fetchBoardingHouses(force = false) {
      if (this.boardingHouses.length > 0 && !force) {
        return this.boardingHouses;
      }
      this.loading = true;
      try {
        const response = await boardingHouseService.getAll();
        this.boardingHouses = response.data.content || [];
        return this.boardingHouses;
      } catch (error) {
        console.error('Error fetching boarding houses:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchBoardingHouseById(id) {
      this.loading = true;
      try {
        const response = await boardingHouseService.getById(id);
        return response.data;
      } catch (error) {
        console.error('Error fetching boarding house by id:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createBoardingHouse(data) {
      try {
        const response = await boardingHouseService.create(data);
        await this.fetchBoardingHouses(true);
        return response.data;
      } catch (error) {
        console.error('Error creating boarding house:', error);
        throw error;
      }
    },
    async updateBoardingHouse(id, data) {
      try {
        const response = await boardingHouseService.update(id, data);
        await this.fetchBoardingHouses(true);
        return response.data;
      } catch (error) {
        console.error('Error updating boarding house:', error);
        throw error;
      }
    },
    async deleteBoardingHouse(id) {
      try {
        await boardingHouseService.delete(id);
        await this.fetchBoardingHouses(true);
      } catch (error) {
        console.error('Error deleting boarding house:', error);
        throw error;
      }
    }
  }
});
