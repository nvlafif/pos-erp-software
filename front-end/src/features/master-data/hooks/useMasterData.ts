import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { Category, Unit } from '../../inventory/types/inventory.types';
import { masterDataService } from '../api/masterDataService';

export function useMasterData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingCategory, setSavingCategory] = useState<boolean>(false);
  const [savingUnit, setSavingUnit] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchAllMasterData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catList, unitList] = await Promise.all([
        masterDataService.getCategories(),
        masterDataService.getUnits(),
      ]);
      setCategories(catList);
      setUnits(unitList);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal memuat data kategori dan satuan dari server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllMasterData();
  }, [fetchAllMasterData]);

  const saveCategory = async (
    name: string,
    editingId?: number
  ): Promise<boolean> => {
    if (!name.trim()) return false;
    setSavingCategory(true);
    setError('');
    setSuccessMessage('');
    try {
      if (editingId) {
        await masterDataService.updateCategory(editingId, { name });
        setSuccessMessage(`Kategori "${name.trim()}" berhasil diperbarui.`);
      } else {
        await masterDataService.createCategory({ name });
        setSuccessMessage(`Kategori "${name.trim()}" berhasil ditambahkan.`);
      }
      await fetchAllMasterData();
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal menyimpan kategori. Pastikan nama kategori belum terdaftar.'
      );
      return false;
    } finally {
      setSavingCategory(false);
    }
  };

  const removeCategory = async (category: Category): Promise<void> => {
    if (
      !window.confirm(
        `Hapus kategori "${category.name}"? Pastikan tidak ada produk aktif yang menggunakan kategori ini.`
      )
    ) {
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      await masterDataService.deleteCategory(category.id);
      setSuccessMessage(`Kategori "${category.name}" telah dihapus.`);
      await fetchAllMasterData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Kategori tidak dapat dihapus karena masih digunakan oleh produk.'
      );
    }
  };

  const saveUnit = async (
    name: string,
    editingId?: number
  ): Promise<boolean> => {
    if (!name.trim()) return false;
    setSavingUnit(true);
    setError('');
    setSuccessMessage('');
    try {
      if (editingId) {
        await masterDataService.updateUnit(editingId, { name });
        setSuccessMessage(`Satuan "${name.trim()}" berhasil diperbarui.`);
      } else {
        await masterDataService.createUnit({ name });
        setSuccessMessage(`Satuan "${name.trim()}" berhasil ditambahkan.`);
      }
      await fetchAllMasterData();
      return true;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Gagal menyimpan satuan. Pastikan nama satuan belum terdaftar.'
      );
      return false;
    } finally {
      setSavingUnit(false);
    }
  };

  const removeUnit = async (unit: Unit): Promise<void> => {
    if (
      !window.confirm(
        `Hapus satuan "${unit.name}"? Pastikan tidak ada produk aktif yang menggunakan satuan ini.`
      )
    ) {
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      await masterDataService.deleteUnit(unit.id);
      setSuccessMessage(`Satuan "${unit.name}" telah dihapus.`);
      await fetchAllMasterData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          'Satuan tidak dapat dihapus karena masih digunakan oleh produk.'
      );
    }
  };

  return {
    categories,
    units,
    loading,
    savingCategory,
    savingUnit,
    error,
    successMessage,
    fetchAllMasterData,
    saveCategory,
    removeCategory,
    saveUnit,
    removeUnit,
  };
}