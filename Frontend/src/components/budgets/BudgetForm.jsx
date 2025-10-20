import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function BudgetForm({ budget, categories, month, year, onSubmit, onCancel }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: budget || {
            category: '',
            allocated_amount: '',
            month,
            year,
        },
    });

    const selectedCategory = watch('category');

    useEffect(() => {
        if (budget) {
            setValue('category', budget.category);
            setValue('allocated_amount', budget.allocated_amount);
            setValue('month', budget.month);
            setValue('year', budget.year);
        }
    }, [budget, setValue]);

    const onFormSubmit = (data) => {
        onSubmit({
            ...data,
            allocated_amount: parseFloat(data.allocated_amount),
            month: parseInt(data.month),
            year: parseInt(data.year),
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
                <Label htmlFor="category">Category * (Expense only)</Label>
                <Select
                    value={selectedCategory?.toString()}
                    onValueChange={(value) => setValue('category', parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.icon} {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
            </div>

            {/* Allocated Amount */}
            <div className="space-y-2">
                <Label htmlFor="allocated_amount">Budget Amount *</Label>
                <Input
                    id="allocated_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('allocated_amount', {
                        required: 'Budget amount is required',
                        min: { value: 0, message: 'Amount must be positive' },
                    })}
                />
                {errors.allocated_amount && (
                    <p className="text-sm text-red-600">{errors.allocated_amount.message}</p>
                )}
            </div>

            {/* Month & Year (read-only for current month) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input
                        id="month"
                        type="number"
                        value={month}
                        readOnly
                        className="bg-gray-50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                        id="year"
                        type="number"
                        value={year}
                        readOnly
                        className="bg-gray-50"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : budget ? 'Update' : 'Add Budget'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}