import { useState } from "react";
import {
    useBudgetComparison,
    useCreateBudget,
    useUpdateBudget,
    useCategories,
} from "../hooks/useApi";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const budgets = comparison?.by_category || [];
    const overall = comparison?.overall || {};

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Budgets
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Manage your monthly budgets for{" "}
                        {new Date(year, month - 1).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Budget
                </Button>
            </div>

            {/* Overall Summary */}
            <Card className="border-2 border-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Overall Budget Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Allocated</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ₹{overall.total_allocated?.toLocaleString("en-IN") || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-red-600">
                                ₹{overall.total_spent?.toLocaleString("en-IN") || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Remaining</p>
                            <p
                                className={`text-2xl font-bold ${overall.total_remaining >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                            >
                                ₹{overall.total_remaining?.toLocaleString("en-IN") || 0}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm font-semibold">
                                {overall.percentage_used?.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={Math.min(overall.percentage_used || 0, 100)}
                            className="h-3"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Chart */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Budget vs Actual Spending
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                        Visual comparison of your budget goals
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <BudgetComparisonChart data={budgets} />
                    </div>
                </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Category Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {budgets.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm sm:text-base">
                                No budgets set for this month
                            </p>
                            <Button onClick={() => setShowForm(true)} className="mt-4">
                                Create Your First Budget
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((budget, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${budget.status === "over" ? "bg-red-100" : "bg-green-100"
                                                    }`}
                                            >
                                                {budget.status === "over" ? (
                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                ) : (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                    {budget.category}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    ₹{budget.spent.toLocaleString("en-IN")} of ₹
                                                    {budget.allocated.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                budget.status === "over" ? "destructive" : "default"
                                            }
                                            className="self-start sm:self-center"
                                        >
                                            {budget.status === "over" ? "Over Budget" : "On Track"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-semibold">
                                                {budget.percentage_used.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(budget.percentage_used, 100)}
                                            className={`h-2 ${budget.status === "over" ? "bg-red-100" : ""
                                                }`}
                                        />
                                        <p className="text-xs text-gray-500 text-right">
                                            Remaining: ₹{budget.remaining.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Form */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-md w-[90vw] sm:w-full">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBudget ? "Edit Budget" : "Add Budget"}
                        </DialogTitle>
                    </DialogHeader>
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
                </DialogContent>
            </Dialog>
        </div>
    );
}
