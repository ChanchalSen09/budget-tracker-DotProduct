from rest_framework import serializers
from .models import Budget
from categories.serializers import CategorySerializer


class BudgetSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    spent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, required=False)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, required=False)
    percentage_used = serializers.FloatField(read_only=True, required=False)
    
    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_details', 'month', 'year',
            'allocated_amount', 'spent_amount', 'remaining_amount',
            'percentage_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_allocated_amount(self, value):
        """Ensure allocated amount is positive"""
        if value < 0:
            raise serializers.ValidationError("Allocated amount must be positive")
        return value

    def validate_month(self, value):
        """Ensure month is between 1-12"""
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Month must be between 1 and 12")
        return value

    def validate_year(self, value):
        """Ensure year is reasonable"""
        current_year = 2025
        if not (2020 <= value <= current_year + 5):
            raise serializers.ValidationError(f"Year must be between 2020 and {current_year + 5}")
        return value

    def validate(self, attrs):
        """Ensure category is an EXPENSE category"""
        category = attrs.get('category')
        
        if category and category.type != 'EXPENSE':
            raise serializers.ValidationError({
                "category": "Budget can only be set for expense categories"
            })
        
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            month = attrs.get('month')
            year = attrs.get('year')
            if not self.instance:
                existing = Budget.objects.filter(
                    user=user,
                    category=category,
                    month=month,
                    year=year
                ).exists()
                
                if existing:
                    raise serializers.ValidationError(
                        "A budget already exists for this category in this month/year"
                    )
        
        return attrs

    def create(self, validated_data):
        """Create budget and set the user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update budget"""
        validated_data.pop('user', None)
        validated_data.pop('category', None)
        validated_data.pop('month', None)
        validated_data.pop('year', None)
        
        return super().update(instance, validated_data)