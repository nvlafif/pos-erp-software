import api from '../../../api/axios';
import type { Category, Unit } from '../../inventory/types/inventory.types';

export interface CategoryPayload {
  name: string;
}

export interface UnitPayload {
  name: string;
}

interface RawCategory {
  id?: number;
  categoryId?: number;
  name?: string;
}

interface RawUnit {
  id?: number;
  unitId?: number;
  name?: string;
}

function normalizeCategory(raw: RawCategory): Category {
  return {
    id: Number(raw.id ?? raw.categoryId ?? 0),
    name: raw.name ?? '',
  };
}

function normalizeUnit(raw: RawUnit): Unit {
  return {
    id: Number(raw.id ?? raw.unitId ?? 0),
    name: raw.name ?? '',
  };
}

export const masterDataService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get('/categories');
    const list: RawCategory[] = res.data?.data ?? res.data ?? [];
    return Array.isArray(list) ? list.map(normalizeCategory) : [];
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const res = await api.post('/categories', {
      name: payload.name.trim(),
    });
    return normalizeCategory(res.data?.data ?? res.data);
  },

  async updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
    const res = await api.put(`/categories/${id}`, {
      name: payload.name.trim(),
    });
    return normalizeCategory(res.data?.data ?? res.data);
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  async getUnits(): Promise<Unit[]> {
    const res = await api.get('/units');
    const list: RawUnit[] = res.data?.data ?? res.data ?? [];
    return Array.isArray(list) ? list.map(normalizeUnit) : [];
  },

  async createUnit(payload: UnitPayload): Promise<Unit> {
    const res = await api.post('/units', {
      name: payload.name.trim(),
    });
    return normalizeUnit(res.data?.data ?? res.data);
  },

  async updateUnit(id: number, payload: UnitPayload): Promise<Unit> {
    const res = await api.put(`/units/${id}`, {
      name: payload.name.trim(),
    });
    return normalizeUnit(res.data?.data ?? res.data);
  },

  async deleteUnit(id: number): Promise<void> {
    await api.delete(`/units/${id}`);
  },
};