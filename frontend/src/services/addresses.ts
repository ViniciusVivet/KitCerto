import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export type Address = {
  id: string;
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAtUtc: string;
};

export type CreateAddressPayload = {
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
};

export type UpdateAddressPayload = CreateAddressPayload;

export async function listAddresses(): Promise<Address[]> {
  return apiGet<Address[]>("/addresses");
}

export async function getAddressById(id: string): Promise<Address> {
  return apiGet<Address>(`/addresses/${id}`);
}

export async function createAddress(payload: CreateAddressPayload): Promise<{ id: string }> {
  return apiPost<{ id: string }>("/addresses", payload);
}

export async function updateAddress(id: string, payload: UpdateAddressPayload): Promise<void> {
  return apiPut<void>(`/addresses/${id}`, payload);
}

export async function deleteAddress(id: string): Promise<void> {
  return apiDelete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<void> {
  return apiPost<void>(`/addresses/${id}/default`, {});
}
