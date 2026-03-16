import httpClient from '../httpClient';

export type PetPayload = {
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

type ApiResult<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

type RawPet = {
  id?: string;
  userId?: string;
  user_id?: string;
  petName?: string;
  pet_name?: string;
  speciesName?: string | null;
  species_name?: string | null;
  breedName?: string | null;
  breed_name?: string | null;
  dateOfBirth?: string | null;
  date_of_birth?: string | null;
  gender?: 'Đực' | 'Cái' | null;
  weight?: number | null;
  color?: string | null;
  microchipId?: string | null;
  microchip_id?: string | null;
  specialNotes?: string | null;
  special_notes?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
};

const unwrap = <T>(response: T | ApiResult<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ApiResult<T>)) {
    return ((response as ApiResult<T>).data as T) ?? (response as T);
  }
  return response as T;
};

const mapPet = (raw: RawPet): Pet => ({
  id: raw.id ?? '',
  userId: raw.userId ?? raw.user_id ?? '',
  petName: raw.petName ?? raw.pet_name ?? '',
  speciesName: raw.speciesName ?? raw.species_name ?? '',
  breedName: raw.breedName ?? raw.breed_name ?? null,
  dateOfBirth: raw.dateOfBirth ?? raw.date_of_birth ?? null,
  gender: raw.gender ?? null,
  weight: raw.weight ?? null,
  color: raw.color ?? null,
  microchipId: raw.microchipId ?? raw.microchip_id ?? null,
  specialNotes: raw.specialNotes ?? raw.special_notes ?? null,
  avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
  isActive: raw.isActive ?? raw.is_active ?? true,
  createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
});

const mapPetArray = (raw: unknown): Pet[] => {
  const data = unwrap(raw as RawPet[] | ApiResult<RawPet[]>);
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapPet(item));
};

const PetAPI = {
  async getMyPets(): Promise<Pet[]> {
    const response = await httpClient.get<RawPet[] | ApiResult<RawPet[]>>('/Pets/my-pets');
    return mapPetArray(response);
  },

  async getActivePets(): Promise<Pet[]> {
    const response = await httpClient.get<RawPet[] | ApiResult<RawPet[]>>('/Pets/my-pets/active');
    return mapPetArray(response);
  },

  async getPet(petId: string): Promise<Pet> {
    const response = await httpClient.get<RawPet | ApiResult<RawPet>>(`/Pets/${petId}`);
    return mapPet(unwrap(response));
  },

  async createPet(data: PetPayload): Promise<Pet> {
    const response = await httpClient.post<RawPet | ApiResult<RawPet>>('/Pets', data);
    return mapPet(unwrap(response));
  },

  async updatePet(petId: string, data: Partial<PetPayload>): Promise<Pet> {
    const response = await httpClient.put<RawPet | ApiResult<RawPet>>(`/Pets/${petId}`, data);
    return mapPet(unwrap(response));
  },

  deletePet(petId: string) {
    return httpClient.delete<void>(`/Pets/${petId}`);
  },
};

export default PetAPI;
