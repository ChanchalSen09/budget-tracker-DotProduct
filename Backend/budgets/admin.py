from django.contrib import admin
from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'month', 'year', 'allocated_amount', 'created_at']
    list_filter = ['month', 'year', 'created_at']
    search_fields = ['user__email', 'category__name']
    ordering = ['-year', '-month']