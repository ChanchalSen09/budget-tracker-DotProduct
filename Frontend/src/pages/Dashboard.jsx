import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useDashboardSummary } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryBreakdownChart from '../components/dashboard/CategoryBreakdownChart';

export default function Dashboard() {
    const today = new Date();
    const [dateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
    });

    const { data: summary, isLoading } = useDashboardSummary(
        dateRange.start,
        dateRange.end
    );

    // Calculate percentage change (mock for now)
    const stats = useMemo(() => {
        if (!summary) return null;

        const income = summary.summary.total_income;
        const expenses = summary.summary.total_expenses;
        const balance = summary.summary.balance;

        return {
            income: {
                amount: income,
                change: '+12.5%', // Mock data
                trend: 'up',
            },
            expenses: {
                amount: expenses,
                change: '-3.2%', // Mock data
                trend: 'down',
            },
            balance: {
                amount: balance,
                change: '+8.1%', // Mock data
                trend: balance >= 0 ? 'up' : 'down',
            },
        };
    }, [summary]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Overview of your financial activities for{' '}
                    {format(new Date(dateRange.start), 'MMMM yyyy')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Income */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Income
                        </CardTitle>
                        <div className="bg-green-100 p-2 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{stats?.income.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center mt-2">
                            <Badge
                                variant="outline"
                                className="text-xs border-green-200 text-green-700 bg-green-50"
                            >
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {stats?.income.change}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Expenses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Expenses
                        </CardTitle>
                        <div className="bg-red-100 p-2 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{stats?.expenses.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center mt-2">
                            <Badge
                                variant="outline"
                                className="text-xs border-green-200 text-green-700 bg-green-50"
                            >
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                {stats?.expenses.change}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Current Balance
                        </CardTitle>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${stats?.balance.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            ₹{stats?.balance.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center mt-2">
                            <Badge
                                variant="outline"
                                className={`text-xs ${stats?.balance.trend === 'up'
                                    ? 'border-green-200 text-green-700 bg-green-50'
                                    : 'border-red-200 text-red-700 bg-red-50'
                                    }`}
                            >
                                {stats?.balance.trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {stats?.balance.change}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <p className="text-sm text-gray-500">Monthly comparison</p>
                    </CardHeader>
                    <CardContent>
                        <IncomeExpenseChart data={summary} />
                    </CardContent>
                </Card>

                {/* Category Breakdown Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <p className="text-sm text-gray-500">Spending by category</p>
                    </CardHeader>
                    <CardContent>
                        <CategoryBreakdownChart data={summary?.category_breakdown || []} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {summary?.category_breakdown?.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                                            }`}
                                    >
                                        {item.type === 'INCOME' ? (
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {item.category__name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.count} transaction{item.count > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`font-semibold ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {item.type === 'INCOME' ? '+' : '-'}₹
                                        {item.total.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}