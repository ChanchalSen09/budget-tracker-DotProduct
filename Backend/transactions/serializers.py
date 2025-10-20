from rest_framework import serializers
from .models import Transaction
from categories.serializers import CategorySerializer


class TransactionSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'category', 'category_details', 'type', 'amount',
            'description', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        if 'category' in attrs and attrs['category']:
            if attrs['category'].type != attrs['type']:
                raise serializers.ValidationError(
                    "Category type must match transaction type"
                )
        return attrs