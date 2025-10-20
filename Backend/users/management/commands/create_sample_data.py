from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from categories.models import Category
from transactions.models import Transaction
from budgets.models import Budget
from django.utils import timezone
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Create test user
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
            }
        )
        if created:
            user.set_password('test123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.email}'))

        # Create categories
        income_categories = [
            {'name': 'Salary', 'icon': '💼', 'color': '#4CAF50'},
            {'name': 'Freelance', 'icon': '💻', 'color': '#2196F3'},
            {'name': 'Investment', 'icon': '📈', 'color': '#FF9800'},
        ]

        expense_categories = [
            {'name': 'Groceries', 'icon': '🛒', 'color': '#F44336'},
            {'name': 'Transportation', 'icon': '🚗', 'color': '#9C27B0'},
            {'name': 'Entertainment', 'icon': '🎬', 'color': '#E91E63'},
            {'name': 'Utilities', 'icon': '💡', 'color': '#607D8B'},
            {'name': 'Healthcare', 'icon': '🏥', 'color': '#00BCD4'},
            {'name': 'Education', 'icon': '📚', 'color': '#3F51B5'},
        ]

        # Create income categories
        for cat_data in income_categories:
            Category.objects.get_or_create(
                user=user,
                name=cat_data['name'],
                type='INCOME',
                defaults={
                    'icon': cat_data['icon'],
                    'color': cat_data['color']
                }
            )

        # Create expense categories
        expense_cats = []
        for cat_data in expense_categories:
            cat, created = Category.objects.get_or_create(
                user=user,
                name=cat_data['name'],
                type='EXPENSE',
                defaults={
                    'icon': cat_data['icon'],
                    'color': cat_data['color']
                }
            )
            expense_cats.append(cat)

        self.stdout.write(self.style.SUCCESS('Categories created'))

        # Create sample transactions
        today = timezone.now().date()
        
        # Income transactions
        salary_cat = Category.objects.get(user=user, name='Salary')
        Transaction.objects.get_or_create(
            user=user,
            category=salary_cat,
            type='INCOME',
            amount=Decimal('50000.00'),
            date=today.replace(day=1),
            defaults={'description': 'Monthly salary'}
        )

        # Expense transactions
        sample_expenses = [
            {'category': 'Groceries', 'amount': 5000, 'description': 'Weekly groceries'},
            {'category': 'Transportation', 'amount': 2000, 'description': 'Fuel'},
            {'category': 'Entertainment', 'amount': 1500, 'description': 'Movie night'},
            {'category': 'Utilities', 'amount': 3000, 'description': 'Electricity bill'},
            {'category': 'Healthcare', 'amount': 2500, 'description': 'Medical checkup'},
        ]

        for i, expense in enumerate(sample_expenses, 1):
            cat = Category.objects.get(user=user, name=expense['category'])
            Transaction.objects.get_or_create(
                user=user,
                category=cat,
                type='EXPENSE',
                date=today.replace(day=i * 5 if i * 5 <= 28 else 28),
                defaults={
                    'amount': Decimal(str(expense['amount'])),
                    'description': expense['description']
                }
            )

        self.stdout.write(self.style.SUCCESS('Transactions created'))

        # Create budgets for current month
        budget_data = [
            {'category': 'Groceries', 'amount': 8000},
            {'category': 'Transportation', 'amount': 5000},
            {'category': 'Entertainment', 'amount': 3000},
            {'category': 'Utilities', 'amount': 4000},
            {'category': 'Healthcare', 'amount': 5000},
        ]

        for budget in budget_data:
            cat = Category.objects.get(user=user, name=budget['category'])
            Budget.objects.get_or_create(
                user=user,
                category=cat,
                month=today.month,
                year=today.year,
                defaults={'allocated_amount': Decimal(str(budget['amount']))}
            )

        self.stdout.write(self.style.SUCCESS('Budgets created'))
        self.stdout.write(self.style.SUCCESS('✅ Sample data creation completed!'))
        self.stdout.write(self.style.WARNING('Test user credentials:'))
        self.stdout.write(self.style.WARNING('Email: test@example.com'))
        self.stdout.write(self.style.WARNING('Password: test123'))