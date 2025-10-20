import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X } from 'lucide-react';

export default function TransactionFilters({ filters, setFilters, categories }) {
    const handleChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filters change
    };

    const handleReset = () => {
        setFilters({
            type: '',
            category: '',
            start_date: '',
            end_date: '',
            min_amount: '',
            max_amount: '',
            page: 1,
        });
    };

    const hasActiveFilters =
        filters.type ||
        filters.category ||
        filters.start_date ||
        filters.end_date ||
        filters.min_amount ||
        filters.max_amount;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div className="space-y-2">
                    <Label htmlFor="type-filter">Type</Label>
                    <Select
                        value={filters.type}
                        onValueChange={(value) => handleChange('type', value)}
                    >
                        <SelectTrigger id="type-filter">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=" ">All types</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                        value={filters.category}
                        onValueChange={(value) => handleChange('category', value)}
                    >
                        <SelectTrigger id="category-filter">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=" ">All categories</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.icon} {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                        id="start-date"
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                        id="end-date"
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Min Amount */}
                <div className="space-y-2">
                    <Label htmlFor="min-amount">Min Amount (₹)</Label>
                    <Input
                        id="min-amount"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={filters.min_amount}
                        onChange={(e) => handleChange('min_amount', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Max Amount */}
                <div className="space-y-2">
                    <Label htmlFor="max-amount">Max Amount (₹)</Label>
                    <Input
                        id="max-amount"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={filters.max_amount}
                        onChange={(e) => handleChange('max_amount', e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {filters.type && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                            Type: {filters.type}
                            <button
                                onClick={() => handleChange('type', '')}
                                className="ml-2 hover:text-blue-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {filters.category && (
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                            Category selected
                            <button
                                onClick={() => handleChange('category', '')}
                                className="ml-2 hover:text-purple-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {filters.start_date && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                            From: {filters.start_date}
                            <button
                                onClick={() => handleChange('start_date', '')}
                                className="ml-2 hover:text-green-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {filters.end_date && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                            To: {filters.end_date}
                            <button
                                onClick={() => handleChange('end_date', '')}
                                className="ml-2 hover:text-green-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {filters.min_amount && (
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                            Min: ₹{filters.min_amount}
                            <button
                                onClick={() => handleChange('min_amount', '')}
                                className="ml-2 hover:text-orange-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {filters.max_amount && (
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                            Max: ₹{filters.max_amount}
                            <button
                                onClick={() => handleChange('max_amount', '')}
                                className="ml-2 hover:text-orange-900"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}