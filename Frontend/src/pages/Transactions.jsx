import { useState } from 'react';
import { format } from 'date-fns';
import {
    useTransactions,
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
    useCategories,
} from '../hooks/useApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionFilters from '../components/transactions/TransactionFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Transactions() {
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        start_date: '',
        end_date: '',
        min_amount: '',
        max_amount: '',
        page: 1,
    });
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data: transactionsData, isLoading } = useTransactions(filters);
    const { data: categories } = useCategories();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const deleteMutation = useDeleteTransaction();

    const handleSubmit = async (data) => {
        try {
            if (editingTransaction) {
                await updateMutation.mutateAsync({ id: editingTransaction.id, ...data });
            } else {
                await createMutation.mutateAsync(data);
            }
            setShowForm(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const transactions = transactionsData?.results || [];
    const totalPages = Math.ceil((transactionsData?.count || 0) / 20);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your income and expenses
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardContent className="pt-6">
                        <TransactionFilters
                            filters={filters}
                            setFilters={setFilters}
                            categories={categories}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold">{transactionsData?.count || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No transactions found</p>
                            <Button onClick={() => setShowForm(true)} className="mt-4">
                                Add Your First Transaction
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'INCOME'
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                    }`}
                                            >
                                                {transaction.type === 'INCOME' ? (
                                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-semibold text-gray-900">
                                                        {transaction.category_details?.name || 'Uncategorized'}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            transaction.type === 'INCOME' ? 'default' : 'destructive'
                                                        }
                                                    >
                                                        {transaction.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {transaction.description || 'No description'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p
                                                    className={`text-lg font-bold ${transaction.type === 'INCOME'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}
                                                >
                                                    {transaction.type === 'INCOME' ? '+' : '-'}₹
                                                    {transaction.amount.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(transaction)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-600">
                                        Showing page {filters.page} of {totalPages}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={filters.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={filters.page === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                        </DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        transaction={editingTransaction}
                        categories={categories}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingTransaction(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}