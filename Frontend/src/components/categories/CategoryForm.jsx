import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const EMOJI_OPTIONS = ['💰', '💼', '📈', '🏦', '🛒', '🍔', '🚗', '🏥', '🎬', '⚡', '📚', '✈️', '🏠', '👕', '🎮', '☕'];

const COLOR_OPTIONS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Indigo', value: '#6366f1' },
];

export default function CategoryForm({ category, onSubmit, onCancel }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: category || {
            name: '',
            type: 'EXPENSE',
            icon: '📁',
            color: '#3b82f6',
        },
    });

    const selectedType = watch('type');
    const selectedIcon = watch('icon');
    const selectedColor = watch('color');
    const categoryName = watch('name');

    useEffect(() => {
        if (category) {
            setValue('name', category.name);
            setValue('type', category.type);
            setValue('icon', category.icon || '📁');
            setValue('color', category.color || '#3b82f6');
        }
    }, [category, setValue]);

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Groceries, Salary, Entertainment"
                    {...register('name', {
                        required: 'Category name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        maxLength: { value: 50, message: 'Name must be less than 50 characters' },
                    })}
                />
                {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                    value={selectedType}
                    onValueChange={(value) => setValue('type', value)}
                >
                    <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INCOME">
                            <div className="flex items-center">
                                <span className="mr-2">📈</span>
                                Income
                            </div>
                        </SelectItem>
                        <SelectItem value="EXPENSE">
                            <div className="flex items-center">
                                <span className="mr-2">📉</span>
                                Expense
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => setValue('icon', emoji)}
                            className={`p-3 text-2xl border-2 rounded-lg hover:bg-gray-50 transition-all ${selectedIcon === emoji
                                ? 'border-primary bg-blue-50 scale-110'
                                : 'border-gray-200'
                                }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedIcon}
                </p>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setValue('color', color.value)}
                            className={`h-10 rounded-lg border-2 transition-all ${selectedColor === color.value
                                ? 'border-gray-900 scale-110 shadow-lg'
                                : 'border-gray-200 hover:border-gray-400'
                                }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
                <div className="flex items-center space-x-3 mt-2">
                    <Input
                        id="color"
                        type="color"
                        {...register('color')}
                        className="w-16 h-10 cursor-pointer"
                    />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">
                            Custom color: <span className="font-mono font-semibold">{selectedColor}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="p-4 border-2 border-dashed rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <p className="text-sm text-gray-600 mb-3 font-medium">Preview:</p>
                <div className="flex items-center space-x-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md transition-all hover:scale-110"
                        style={{ backgroundColor: selectedColor + '30', border: `3px solid ${selectedColor}` }}
                    >
                        {selectedIcon}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">
                            {categoryName || 'Category Name'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedType === 'INCOME'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                {selectedType}
                            </span>
                            <span className="text-xs text-gray-500">
                                Color: {selectedColor}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : category ? (
                        'Update Category'
                    ) : (
                        'Add Category'
                    )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}