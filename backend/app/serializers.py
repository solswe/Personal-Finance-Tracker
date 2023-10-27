from rest_framework import serializers
from .models import User, Income, Expense

# Create Serializers Here

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'user', 'amount', 'source', 'description', 'type', 'interval', 'date']

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'user', 'amount', 'category', 'description', 'type', 'interval', 'date']

class UserSerializer(serializers.ModelSerializer):
    incomes = IncomeSerializer(many=True)
    expenses = ExpenseSerializer(many=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'income_goal', 'expense_budget', 'incomes', 'expenses']
