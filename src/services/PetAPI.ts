import httpClient from './httpClient';

export type PetPayload = {
  name: string;
  species: string;
  breed?: string;
  age?: string;
  note?: string;
};

export type Pet = {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  breed?: string;
  age?: string;
  note?: string;
};

const PetAPI = {
  getMyPets() {
    return httpClient.get<Pet[]>('/Pets/my-pets');
  },

  getActivePets() {
    return httpClient.get<Pet[]>('/Pets/my-pets/active');
  },

  getPet(petId: string) {
    return httpClient.get<Pet>(`/Pets/${petId}`);
  },

  createPet(data: PetPayload) {
    return httpClient.post<Pet>('/Pets', data);
  },

  updatePet(petId: string, data: Partial<PetPayload>) {
    return httpClient.put<Pet>(`/Pets/${petId}`, data);
  },

  deletePet(petId: string) {
    return httpClient.delete<void>(`/Pets/${petId}`);
  },
};

export default PetAPI;
