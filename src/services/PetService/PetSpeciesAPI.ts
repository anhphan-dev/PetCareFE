import httpClient from '../httpClient';

export type Breed = {
    id: string;
    breedName: string;
    speciesId?: string;
    characteristics?: string;
    
};

export type PetSpecies = {
    id: string;
    speciesName: string;
    description: string;
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
