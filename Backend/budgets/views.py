from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from datetime import datetime
from .models import Budget
from .serializers import BudgetSerializer
from transactions.models import Transaction


@extend_schema(tags=['Budgets'])
class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing monthly budgets.
    
    Budgets can only be set for EXPENSE categories.
    """
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['month', 'year', 'category']
    ordering_fields = ['month', 'year', 'allocated_amount']

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).select_related('category')

    @extend_schema(
        summary="List all budgets",
        description="Get paginated list of budgets with filtering by month/year.",
        parameters=[
            OpenApiParameter('month', OpenApiTypes.INT, description='Filter by month (1-12)'),
            OpenApiParameter('year', OpenApiTypes.INT, description='Filter by year'),
            OpenApiParameter('category', OpenApiTypes.INT, description='Filter by category ID'),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create budget",
        description="Create a new monthly budget for an expense category.",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Get budget",
        description="Retrieve a specific budget by ID.",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update budget",
        description="Update a budget's allocated amount.",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete budget",
        description="Delete a budget permanently.",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Get current month budget",
        description="Get budgets for current or specified month with spent amounts and percentage used. Perfect for budget tracking.",
        parameters=[
            OpenApiParameter('month', OpenApiTypes.INT, description='Month (1-12), default: current month'),
            OpenApiParameter('year', OpenApiTypes.INT, description='Year, default: current year'),
        ],
    )
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current month budget"""
        today = timezone.now()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        
        budgets = self.get_queryset().filter(month=month, year=year)
        
        # Annotate with spent amounts
        budget_data = []
        for budget in budgets:
            # Get spent amount for this category in this month
            spent = Transaction.objects.filter(
                user=request.user,
                category=budget.category,
                type='EXPENSE',
                date__year=year,
                date__month=month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            remaining = budget.allocated_amount - spent
            percentage = (float(spent) / float(budget.allocated_amount) * 100) if budget.allocated_amount > 0 else 0
            
            budget_dict = BudgetSerializer(budget).data
            budget_dict['spent_amount'] = float(spent)
            budget_dict['remaining_amount'] = float(remaining)
            budget_dict['percentage_used'] = round(percentage, 2)
            budget_data.append(budget_dict)
        
        return Response({
            'month': month,
            'year': year,
            'budgets': budget_data
        })

    @extend_schema(
        summary="Get budget comparison",
        description="Compare allocated budget vs actual expenses with detailed breakdown by category. Shows which categories are over/under budget.",
        parameters=[
            OpenApiParameter('month', OpenApiTypes.INT, description='Month (1-12), default: current month'),
            OpenApiParameter('year', OpenApiTypes.INT, description='Year, default: current year'),
        ],
    )
    @action(detail=False, methods=['get'])
    def comparison(self, request):
        """Compare budget vs actual expenses"""
        today = timezone.now()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        
        budgets = self.get_queryset().filter(month=month, year=year)
        
        total_allocated = budgets.aggregate(total=Sum('allocated_amount'))['total'] or 0
        
        # Get total expenses for the month
        total_spent = Transaction.objects.filter(
            user=request.user,
            type='EXPENSE',
            date__year=year,
            date__month=month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Category-wise comparison
        comparisons = []
        for budget in budgets:
            spent = Transaction.objects.filter(
                user=request.user,
                category=budget.category,
                type='EXPENSE',
                date__year=year,
                date__month=month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            comparisons.append({
                'category': budget.category.name,
                'allocated': float(budget.allocated_amount),
                'spent': float(spent),
                'remaining': float(budget.allocated_amount - spent),
                'percentage_used': round((float(spent) / float(budget.allocated_amount) * 100), 2) if budget.allocated_amount > 0 else 0,
                'status': 'over' if spent > budget.allocated_amount else 'under'
            })
        
        return Response({
            'period': f"{month}/{year}",
            'overall': {
                'total_allocated': float(total_allocated),
                'total_spent': float(total_spent),
                'total_remaining': float(total_allocated - total_spent),
                'percentage_used': round((float(total_spent) / float(total_allocated) * 100), 2) if total_allocated > 0 else 0
            },
            'by_category': comparisons
        })