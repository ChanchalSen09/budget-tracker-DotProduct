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
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionFilters from '../components/transactions/TransactionFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
            </div>
        );
    }

    const transactions = transactionsData?.results || [];
    const totalPages = Math.ceil((transactionsData?.count || 0) / 20);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                            Transactions
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">
                            Manage your income and expenses
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full sm:w-auto"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="w-full sm:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                        </Button>
                    </div>
                </div>
                {showFilters && (
                    <TransactionFilters
                        filters={filters}
                        setFilters={setFilters}
                        categories={categories}
                    />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Total Transactions</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                                        {transactionsData?.count || 0}
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="border-b bg-white sticky top-0 z-10">
                        <CardTitle className="text-lg sm:text-xl">
                            All Transactions
                            {transactionsData?.count > 0 && (
                                <span className="text-sm sm:text-base font-normal text-gray-500 ml-2">
                                    ({transactionsData.count} total)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12 sm:py-16">
                                <div className="text-gray-400 mb-4">
                                    <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                                </div>
                                <p className="text-sm sm:text-base text-gray-500 mb-4">
                                    No transactions found
                                </p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="w-full sm:w-auto"
                                >
                                    Add Your First Transaction
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="hidden lg:block space-y-3">
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
                                                <div className="flex-1">
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
                                                <p
                                                    className={`text-lg font-bold ${transaction.type === 'INCOME'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}
                                                >
                                                    {transaction.type === 'INCOME' ? '+' : '-'}₹
                                                    {transaction.amount.toLocaleString('en-IN')}
                                                </p>
                                                <div className="flex space-x-1">
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
                                <div className="lg:hidden space-y-3">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="p-3 sm:p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div
                                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'INCOME'
                                                            ? 'bg-green-100'
                                                            : 'bg-red-100'
                                                            }`}
                                                    >
                                                        {transaction.type === 'INCOME' ? (
                                                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                            {transaction.category_details?.name || 'Uncategorized'}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                transaction.type === 'INCOME' ? 'default' : 'destructive'
                                                            }
                                                            className="text-xs mt-1"
                                                        >
                                                            {transaction.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`text-lg sm:text-xl font-bold flex-shrink-0 ${transaction.type === 'INCOME'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}
                                                >
                                                    {transaction.type === 'INCOME' ? '+' : '-'}₹
                                                    {transaction.amount.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                                                {transaction.description || 'No description'}
                                            </p>
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                                </p>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(transaction)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                                        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                            Page {filters.page} of {totalPages} ({transactionsData.count} total)
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(filters.page - 1)}
                                                disabled={filters.page === 1}
                                                className="flex items-center"
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                <span className="hidden sm:inline">Previous</span>
                                            </Button>

                                            <div className="hidden md:flex items-center space-x-1">
                                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={filters.page === pageNum ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(filters.page + 1)}
                                                disabled={filters.page === totalPages}
                                                className="flex items-center"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto">
                        <TransactionForm
                            transaction={editingTransaction}
                            categories={categories}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingTransaction(null);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}