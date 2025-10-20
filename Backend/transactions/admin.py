from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'amount', 'category', 'date', 'created_at']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['user__email', 'description', 'category__name']
    ordering = ['-date', '-created_at']
    date_hierarchy = 'date'