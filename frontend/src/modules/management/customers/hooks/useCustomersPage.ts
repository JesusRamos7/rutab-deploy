// frontend/src/modules/management/customers/hooks/useCustomersPage.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Customer } from "../types";
import { CustomerService } from "../Customers.service";

export const useCustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await CustomerService.getAll();
      setCustomers(data || []);
    } catch (error: any) {
      toast.error(error.message || "Hubo un problema al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Lógica del Buscador ---
  const filteredCustomers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return customers;

    return customers.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lowerSearch) ||
        c.direccion.toLowerCase().includes(lowerSearch) || // Añadido: búsqueda por dirección
        (c.contacto && c.contacto.toLowerCase().includes(lowerSearch)) ||
        (c.correo && c.correo.toLowerCase().includes(lowerSearch)) ||
        (c.codigo && c.codigo.toLowerCase().includes(lowerSearch)),
    );
  }, [customers, searchTerm]);

  // --- Estadísticas ---
  const stats = useMemo(() => {
    const currentCustomers = customers || [];
    const activos = currentCustomers.filter(
      (c) => c.estatus === "Activo",
    ).length;
    const total = currentCustomers.length;

    // Nota: totalPedidos dependerá de si el backend lo incluye en el SELECT de SQL Raw
    const totalPedidos = currentCustomers.reduce(
      (sum, c) => sum + (Number(c.totalPedidos) || 0),
      0,
    );

    return { total, activos, totalPedidos };
  }, [customers]);

  const openNewModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };
  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
    setTimeout(() => setCustomerToDelete(null), 200);
  };

  const executeDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await CustomerService.delete(customerToDelete.id);
      toast.success(
        `Cliente ${customerToDelete.nombre} eliminado correctamente`,
      );
      await fetchCustomers();
      closeConfirmModal();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers: filteredCustomers,
    isLoading,
    searchTerm,
    setSearchTerm,
    stats,
    isModalOpen,
    selectedCustomer,
    openNewModal,
    openEditModal,
    closeModal,
    fetchCustomers,
    isConfirmOpen,
    customerToDelete,
    isDeleting,
    confirmDelete,
    closeConfirmModal,
    executeDelete,
  };
};
