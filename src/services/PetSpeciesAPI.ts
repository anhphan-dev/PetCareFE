import httpClient from './httpClient';

export type Breed = {
  id: string;
  name: string;
  speciesId?: string;
};

export type PetSpecies = {
  id: string;
  name: string;
  displayOrder?: number;
  breeds?: Breed[];
};

const PetSpeciesAPI = {
  getAll() {
    return httpClient.get<PetSpecies[]>('/PetSpecies');
  },

  getWithBreeds() {
    return httpClient.get<PetSpecies[]>('/PetSpecies/with-breeds');
  },

  getById(id: string) {
    return httpClient.get<PetSpecies>(`/PetSpecies/${id}`);
  },

  getBreeds() {
    return httpClient.get<Breed[]>('/PetSpecies/breeds');
  },

  getBreedsBySpecies(speciesId: string) {
    return httpClient.get<Breed[]>(`/PetSpecies/${speciesId}/breeds`);
  },

  getBreedById(breedId: string) {
    return httpClient.get<Breed>(`/PetSpecies/breeds/${breedId}`);
  },
};

export default PetSpeciesAPI;
