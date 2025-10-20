import { useState } from 'react';
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../hooks/useApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import CategoryForm from '../components/categories/CategoryForm';

export default function Categories() {
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data: categories, isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const handleSubmit = async (data) => {
        try {
            if (editingCategory) {
                await updateMutation.mutateAsync({ id: editingCategory.id, ...data });
            } else {
                await createMutation.mutateAsync(data);
            }
            setShowForm(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will affect related transactions.')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const incomeCategories = categories?.filter((c) => c.type === 'INCOME') || [];
    const expenseCategories = categories?.filter((c) => c.type === 'EXPENSE') || [];

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">
                        Organize your income and expenses
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Stats section */}
            <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            Income Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                            {incomeCategories.length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                            Expense Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">
                            {expenseCategories.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Income Categories */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        Income Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {incomeCategories.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No income categories yet
                        </p>
                    ) : (
                        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {incomeCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: category.color + '20' }}
                                            >
                                                {category.icon || '📁'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {category.name}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-200 text-green-700 bg-green-50"
                                                >
                                                    Income
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                        Expense Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {expenseCategories.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No expense categories yet
                        </p>
                    ) : (
                        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {expenseCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: category.color + '20' }}
                                            >
                                                {category.icon || '📁'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {category.name}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="border-red-200 text-red-700 bg-red-50"
                                                >
                                                    Expense
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={editingCategory}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingCategory(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
