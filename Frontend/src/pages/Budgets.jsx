import { useState } from "react";
import {
    useBudgetComparison,
    useCreateBudget,
    useUpdateBudget,
    useDeleteBudget,
    useCategories,
} from "../hooks/useApi";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
    Plus,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Calendar,
    Edit,
    Trash2,
    DollarSign
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import BudgetForm from "../components/budgets/BudgetForm";
import BudgetComparisonChart from "../components/budgets/BudgetComparisonChart";

export default function Budgets() {
    const today = new Date();
    const [month] = useState(today.getMonth() + 1);
    const [year] = useState(today.getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const { data: comparison, isLoading } = useBudgetComparison(month, year);
    const { data: categories } = useCategories();
    const createMutation = useCreateBudget();
    const updateMutation = useUpdateBudget();
    const deleteMutation = useDeleteBudget();

    const handleSubmit = async (data) => {
        try {
            if (editingBudget) {
                await updateMutation.mutateAsync({ id: editingBudget.id, ...data });
            } else {
                await createMutation.mutateAsync(data);
            }
            setShowForm(false);
            setEditingBudget(null);
        } catch (error) {
            console.error("Error saving budget:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this budget?")) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error("Error deleting budget:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading budgets...</p>
                </div>
            </div>
        );
    }

    const budgets = comparison?.by_category || [];
    const overall = comparison?.overall || {};

    return (
        <div className="min-h-screen bg-gray-50 pb-20 px-4" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
            <div className="w-full" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-4" style={{ maxWidth: '100%' }}>
                    <div className="space-y-4 sm:space-y-6" style={{ maxWidth: '100%' }}>
                        {/* Header - Enhanced Responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                    Budgets
                                </h1>
                                <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-base text-gray-500">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                    <span className="truncate">
                                        {new Date(year, month - 1).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
                                size="lg"
                            >
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                <span className="text-sm sm:text-base whitespace-nowrap">Add Budget</span>
                            </Button>
                        </div>

                        {/* Overall Summary - Enhanced Cards */}
                        <Card className="border-2 border-primary shadow-md hover:shadow-xl transition-all" style={{ maxWidth: '100%' }}>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary flex-shrink-0" />
                                    <span className="truncate">Overall Budget Summary</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Stats Grid - Responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                    {/* Total Allocated */}
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <p className="text-xs font-medium text-blue-700">
                                                Total Allocated
                                            </p>
                                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                                        </div>
                                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 break-words">
                                            ₹{overall.total_allocated?.toLocaleString("en-IN") || 0}
                                        </p>
                                    </div>

                                    {/* Total Spent */}
                                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <p className="text-xs font-medium text-red-700">
                                                Total Spent
                                            </p>
                                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                                        </div>
                                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600 break-words">
                                            ₹{overall.total_spent?.toLocaleString("en-IN") || 0}
                                        </p>
                                    </div>

                                    {/* Remaining */}
                                    <div className={`${overall.total_remaining >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                        } p-3 sm:p-4 rounded-lg border`}>
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <p className={`text-xs font-medium ${overall.total_remaining >= 0 ? "text-green-700" : "text-red-700"
                                                }`}>
                                                Remaining
                                            </p>
                                            {overall.total_remaining >= 0 ? (
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className={`text-lg sm:text-2xl lg:text-3xl font-bold break-words ${overall.total_remaining >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            ₹{overall.total_remaining?.toLocaleString("en-IN") || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                        <span className="text-xs sm:text-base font-semibold text-gray-700">
                                            Overall Progress
                                        </span>
                                        <span className="text-base sm:text-xl font-bold text-gray-900">
                                            {overall.percentage_used?.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(overall.percentage_used || 0, 100)}
                                        className="h-3 sm:h-4"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        {overall.percentage_used > 100 ? "⚠️ Over budget!" : "On track"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chart - FIXED: Complete containment */}
                        <Card className="shadow-md hover:shadow-xl transition-all" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    Budget vs Actual Spending
                                </CardTitle>
                                <p className="text-xs text-gray-500 mt-1">
                                    Visual comparison of your budget goals
                                </p>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                {/* FIXED: Chart with proper containment */}
                                <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
                                    <div style={{ minWidth: '300px', padding: '0 16px' }}>
                                        <BudgetComparisonChart data={budgets} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown - Enhanced Cards */}
                        <Card className="shadow-md hover:shadow-xl transition-all" style={{ maxWidth: '100%' }}>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
                                    <span>Category Breakdown</span>
                                    {budgets.length > 0 && (
                                        <span className="text-xs sm:text-base font-normal text-gray-500">
                                            ({budgets.length} {budgets.length === 1 ? "category" : "categories"})
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6">
                                {budgets.length === 0 ? (
                                    <div className="text-center py-12 sm:py-16">
                                        <div className="text-gray-400 mb-4">
                                            <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-500 mb-4">
                                            No budgets set for this month
                                        </p>
                                        <Button
                                            onClick={() => setShowForm(true)}
                                            className="w-full sm:w-auto"
                                            size="lg"
                                        >
                                            Create Your First Budget
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
                                        {budgets.map((budget, index) => (
                                            <div
                                                key={index}
                                                className="p-3 sm:p-4 border-2 rounded-xl bg-white hover:shadow-lg transition-all"
                                                style={{ maxWidth: '100%' }}
                                            >
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        <div
                                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${budget.status === "over" ? "bg-red-100" : "bg-green-100"
                                                                }`}
                                                        >
                                                            {budget.status === "over" ? (
                                                                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                                            ) : (
                                                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
                                                                {budget.category}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">
                                                                ₹{budget.spent.toLocaleString("en-IN")} of ₹
                                                                {budget.allocated.toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={budget.status === "over" ? "destructive" : "default"}
                                                        className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap"
                                                    >
                                                        {budget.status === "over" ? "Over" : "On Track"}
                                                    </Badge>
                                                </div>

                                                {/* Progress */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                                        <span className="text-gray-600 font-medium">Progress</span>
                                                        <span className="font-bold text-gray-900">
                                                            {budget.percentage_used.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(budget.percentage_used, 100)}
                                                        className={`h-2.5 sm:h-3 ${budget.status === "over" ? "bg-red-100" : ""
                                                            }`}
                                                    />
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 flex-wrap gap-1">
                                                        <span className="break-words">
                                                            Remaining: ₹{Math.abs(budget.remaining).toLocaleString("en-IN")}
                                                            {budget.remaining < 0 && " over"}
                                                        </span>
                                                        {budget.percentage_used > 90 && budget.status !== "over" && (
                                                            <span className="text-orange-600 font-medium whitespace-nowrap">⚠️ Nearly depleted</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialog Form - Responsive */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            {editingBudget ? "Edit Budget" : "Add Budget"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 px-1">
                        <BudgetForm
                            budget={editingBudget}
                            categories={categories?.filter((c) => c.type === "EXPENSE")}
                            month={month}
                            year={year}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingBudget(null);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}