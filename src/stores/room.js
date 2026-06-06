import { defineStore } from 'pinia';
import roomService from '../services/roomService';

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    loading: false,
    totalPages: 0,
    totalElements: 0
  }),
  actions: {
    async fetchRooms(params) {
      this.loading = true;
      try {
        const response = await roomService.getAll(params);
        this.rooms = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalElements = response.data.totalElements || 0;
        return this.rooms;
      } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchRoomsByBoardingHouse(houseId, params) {
      this.loading = true;
      try {
        const response = await roomService.getByBoardingHouse(houseId, params);
        this.rooms = response.data.content || [];
        this.totalPages = response.data.totalPages || 1;
        this.totalElements = response.data.totalElements || 0;
        return this.rooms;
      } catch (error) {
        console.error('Error fetching rooms by boarding house:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createRoom(houseId, data) {
      try {
        const response = await roomService.create(houseId, data);
        return response.data;
      } catch (error) {
        console.error('Error creating room:', error);
        throw error;
      }
    },
    async updateRoom(id, data) {
      try {
        const response = await roomService.update(id, data);
        return response.data;
      } catch (error) {
        console.error('Error updating room:', error);
        throw error;
      }
    },
    async deleteRoom(id) {
      try {
        await roomService.delete(id);
      } catch (error) {
        console.error('Error deleting room:', error);
        throw error;
      }
    }
  }
});
