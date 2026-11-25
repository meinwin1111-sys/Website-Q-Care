import api from "./api";

export type PetPayload = {
  name: string;
  petType: string;
  customType?: string | null;
};

export type Pet = {
  id: number;
  name: string;
  petType: string;
  customType?: string | null;
  value: string;
  label: string;
  emoji: string;
};

export async function getMyPets() {
  const { data } = await api.get<Pet | Pet[]>("/pets/my-pets");
  return Array.isArray(data) ? data : [data];
}

export async function addPet(payload: PetPayload) {
  const { data } = await api.post<Pet>("/pets", payload);
  return data;
}
