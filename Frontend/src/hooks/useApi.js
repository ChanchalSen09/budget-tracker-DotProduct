import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

// ========== CATEGORIES ==========
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories/");
      return data.results || data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCategory) => api.post("/categories/", newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/categories/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ========== TRANSACTIONS ==========
export const useTransactions = (filters = {}) => {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const { data } = await api.get(`/transactions/?${params.toString()}`);
      return data;
    },
  });
};

export const useTransaction = (id) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data } = await api.get(`/transactions/${id}/`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTransaction) => api.post("/transactions/", newTransaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/transactions/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};

// ========== DASHBOARD ==========
export const useDashboardSummary = (startDate, endDate) => {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      const { data } = await api.get(
        `/transactions/summary/?${params.toString()}`
      );
      return data;
    },
  });
};

// ========== BUDGETS ==========
export const useBudgets = (month, year) => {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);
      const { data } = await api.get(`/budgets/?${params.toString()}`);
      return data.results || data;
    },
  });
};

export const useCurrentBudget = (month, year) => {
  return useQuery({
    queryKey: ["budget-current", month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);
      const { data } = await api.get(`/budgets/current/?${params.toString()}`);
      return data;
    },
  });
};

export const useBudgetComparison = (month, year) => {
  return useQuery({
    queryKey: ["budget-comparison", month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (year) params.append("year", year);
      const { data } = await api.get(
        `/budgets/comparison/?${params.toString()}`
      );
      return data;
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBudget) => api.post("/budgets/", newBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/budgets/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-current"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
    },
  });
};
