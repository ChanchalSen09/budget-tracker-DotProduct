import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';

export default function TransactionForm({ transaction, categories, onSubmit, onCancel }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: transaction || {
            type: 'EXPENSE',
            category: '',
            amount: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const selectedType = watch('type');
    const selectedCategory = watch('category');

    // Filter categories based on type
    const filteredCategories = categories?.filter(
        (cat) => cat.type === selectedType
    ) || [];

    useEffect(() => {
        if (transaction) {
            setValue('type', transaction.type);
            setValue('category', transaction.category);
            setValue('amount', transaction.amount);
            setValue('description', transaction.description);
            setValue('date', transaction.date);
        }
    }, [transaction, setValue]);

    const onFormSubmit = (data) => {
        onSubmit({
            ...data,
            amount: parseFloat(data.amount),
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Type Selection */}
            <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                    value={selectedType}
                    onValueChange={(value) => {
                        setValue('type', value);
                        setValue('category', ''); // Reset category when type changes
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                    value={selectedCategory?.toString()}
                    onValueChange={(value) => setValue('category', parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map((cat) => (
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

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', {
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' },
                    })}
                />
                {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                    id="date"
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                    <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    type="text"
                    placeholder="Enter description (optional)"
                    {...register('description')}
                />
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : transaction ? 'Update' : 'Add Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}