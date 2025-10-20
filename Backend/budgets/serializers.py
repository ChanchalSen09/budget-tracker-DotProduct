from rest_framework import serializers
from .models import Budget
from categories.serializers import CategorySerializer


class BudgetSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    spent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    percentage_used = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_details', 'month', 'year',
            'allocated_amount', 'spent_amount', 'remaining_amount',
            'percentage_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        # Ensure category is an EXPENSE category
        if 'category' in attrs and attrs['category'].type != 'EXPENSE':
            raise serializers.ValidationError(
                "Budget can only be set for expense categories"
            )
        return attrs