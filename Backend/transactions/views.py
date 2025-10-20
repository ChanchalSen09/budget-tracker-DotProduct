from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from datetime import datetime
from .models import Transaction
from .serializers import TransactionSerializer
from .filters import TransactionFilter


@extend_schema(tags=['Transactions'])
class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing income and expense transactions.
    
    Supports filtering by type, category, date range, and amount range.
    """
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['description']
    ordering_fields = ['date', 'amount', 'created_at']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('category')

    @extend_schema(
        summary="List all transactions",
        description="Get paginated list of transactions with filtering support.",
        parameters=[
            OpenApiParameter('type', OpenApiTypes.STR, description='Filter by INCOME or EXPENSE'),
            OpenApiParameter('category', OpenApiTypes.INT, description='Filter by category ID'),
            OpenApiParameter('start_date', OpenApiTypes.DATE, description='Filter from date (YYYY-MM-DD)'),
            OpenApiParameter('end_date', OpenApiTypes.DATE, description='Filter to date (YYYY-MM-DD)'),
            OpenApiParameter('min_amount', OpenApiTypes.NUMBER, description='Minimum amount'),
            OpenApiParameter('max_amount', OpenApiTypes.NUMBER, description='Maximum amount'),
            OpenApiParameter('search', OpenApiTypes.STR, description='Search in description'),
            OpenApiParameter('ordering', OpenApiTypes.STR, description='Order by field'),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create transaction",
        description="Create a new income or expense transaction.",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get transaction",
        description="Retrieve a specific transaction by ID.",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update transaction",
        description="Update all fields of a transaction.",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete transaction",
        description="Delete a transaction permanently.",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Get dashboard summary",
        description="Get financial summary with total income, expenses, balance, and category breakdown. Perfect for dashboard charts.",
        parameters=[
            OpenApiParameter('start_date', OpenApiTypes.DATE, description='Summary from date (default: current month start)'),
            OpenApiParameter('end_date', OpenApiTypes.DATE, description='Summary to date (default: today)'),
        ],
    )
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get financial summary for dashboard"""
        # Get current month
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Allow custom date range
        start_date = request.query_params.get('start_date', month_start)
        end_date = request.query_params.get('end_date', today)
        
        queryset = self.get_queryset().filter(date__range=[start_date, end_date])
        
        # Calculate totals
        income = queryset.filter(type='INCOME').aggregate(total=Sum('amount'))['total'] or 0
        expenses = queryset.filter(type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
        balance = income - expenses
        
        # Category-wise breakdown
        category_breakdown = queryset.values('category__name', 'type').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_income': float(income),
                'total_expenses': float(expenses),
                'balance': float(balance),
                'transaction_count': queryset.count()
            },
            'category_breakdown': list(category_breakdown)
        })