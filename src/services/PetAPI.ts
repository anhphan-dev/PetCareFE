import httpClient from './httpClient';

export type PetPayload = {
  userId: string;
  petName: string;
  speciesId?: string;
  breedId?: string;
  dateOfBirth?: string | null;
  age?: string | null;
  gender?: 'Đực' | 'Cái' | null;
  weight?: number | null;
  color?: string | null;
  specialNotes?: string | null;
  microchipId?: string | null;
  avatarUrl?: string; // Base64 image
  isActive?: boolean; // allow toggling active state on update
};

export type Pet = {
  id: string;
  userId: string;
  petName: string;
  speciesName: string;
  breedName?: string | null;
  dateOfBirth?: string | null;
  gender?: 'Đực' | 'Cái' | null;
  weight?: number | null;
  age?: string | null;
  color?: string | null;
  microchipId?: string | null;
  specialNotes?: string | null;
  avatarUrl?: string | null; // Base64 or image URL
  isActive: boolean;
  createdAt: string;
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
