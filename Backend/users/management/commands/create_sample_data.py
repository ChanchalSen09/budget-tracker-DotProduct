from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from categories.models import Category
from transactions.models import Transaction
from budgets.models import Budget
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = "Create sample data for testing"

    def handle(self, *args, **kwargs):
        self.stdout.write(" Creating sample data...")

        users_data = [
            {"email": "chanchal@dev.com", "first_name": "Chanchal", "last_name": "Sen"},
            {"email": "testuser@example.com", "first_name": "Test", "last_name": "User"},
        ]

        users = []
        for u in users_data:
            user, created = User.objects.get_or_create(
                email=u["email"], defaults={"first_name": u["first_name"], "last_name": u["last_name"]}
            )
            if created:
                user.set_password("DotProduct")
                user.save()
                self.stdout.write(self.style.SUCCESS(f" Created user: {user.email}"))
            users.append(user)
        income_categories = [
            {"name": "Salary", "icon": "💼", "color": "#4CAF50"},
            {"name": "Freelance", "icon": "💻", "color": "#2196F3"},
            {"name": "Investment", "icon": "📈", "color": "#FF9800"},
        ]

        expense_categories = [
            {"name": "Groceries", "icon": "🛒", "color": "#F44336"},
            {"name": "Transportation", "icon": "🚗", "color": "#9C27B0"},
            {"name": "Entertainment", "icon": "🎬", "color": "#E91E63"},
            {"name": "Utilities", "icon": "💡", "color": "#607D8B"},
            {"name": "Healthcare", "icon": "🏥", "color": "#00BCD4"},
            {"name": "Education", "icon": "📚", "color": "#3F51B5"},
            {"name": "Shopping", "icon": "🛍️", "color": "#FF5722"},
            {"name": "Dining Out", "icon": "🍽️", "color": "#795548"},
        ]

        for user in users:
            for cat_data in income_categories:
                Category.objects.get_or_create(
                    user=user,
                    name=cat_data["name"],
                    type="INCOME",
                    defaults={"icon": cat_data["icon"], "color": cat_data["color"]},
                )

            for cat_data in expense_categories:
                Category.objects.get_or_create(
                    user=user,
                    name=cat_data["name"],
                    type="EXPENSE",
                    defaults={"icon": cat_data["icon"], "color": cat_data["color"]},
                )

        self.stdout.write(self.style.SUCCESS("📂 Categories created"))
        today = timezone.now().date()

        for user in users:
            salary_cat = Category.objects.get(user=user, name="Salary")

            for month_offset in range(0, 3):
                date_ref = today - timedelta(days=month_offset * 30)
                Transaction.objects.get_or_create(
                    user=user,
                    category=salary_cat,
                    type="INCOME",
                    date=date_ref.replace(day=1),
                    defaults={
                        "amount": Decimal("50000.00") + Decimal(random.randint(-2000, 2000)),
                        "description": f"Monthly salary for {date_ref.strftime('%B')}",
                    },
                )
                expense_cats = Category.objects.filter(user=user, type="EXPENSE")
                for _ in range(random.randint(10, 15)):
                    cat = random.choice(expense_cats)
                    random_day = random.randint(1, 28)
                    Transaction.objects.create(
                        user=user,
                        category=cat,
                        type="EXPENSE",
                        date=date_ref.replace(day=random_day),
                        amount=Decimal(random.randint(200, 6000)),
                        description=f"{cat.name} expense on {date_ref.strftime('%B')} {random_day}",
                    )

        self.stdout.write(self.style.SUCCESS("Transactions created"))
        for user in users:
            expense_cats = Category.objects.filter(user=user, type="EXPENSE")
            for cat in expense_cats:
                allocated_amount = Decimal(random.randint(3000, 10000))
                Budget.objects.get_or_create(
                    user=user,
                    category=cat,
                    month=today.month,
                    year=today.year,
                    defaults={"allocated_amount": allocated_amount},
                )

        self.stdout.write(self.style.SUCCESS("Budgets created"))
        self.stdout.write(self.style.SUCCESS("Sample data creation completed!"))
        self.stdout.write(self.style.WARNING("Test user credentials:"))
        self.stdout.write(self.style.WARNING("Email: chanchal@dev.com"))
        self.stdout.write(self.style.WARNING("Password: DotProduct"))
