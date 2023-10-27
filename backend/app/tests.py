from django.test import TestCase
from app.models import User, Income, Expense

# Create your tests here.

# first_name = models.CharField(max_length=100, default='')
# last_name = models.CharField(max_length=100, default='')
# username = models.CharField(max_length = 50, blank = True, null = True, unique = True)
# email = models.EmailField(('email address'), unique = True)
# USERNAME_FIELD = 'username'
# REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'email']


class UserTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='test_user',
            first_name='Test',
            last_name='User',
            email='testuser@email.com'
        )
    
    def test_first_name(self):
        user = User.objects.get(id=self.user.id)

        field_label = user._meta.get_field('first_name').verbose_name
        self.assertEqual(field_label, 'first name')
        
        max_length = user._meta.get_field('first_name').max_length
        self.assertEqual(max_length, 100)
        
        actual_first_name = user.first_name
        self.assertEqual(actual_first_name, 'Test')

    def test_last_name(self):
        user = User.objects.get(id=self.user.id)

        field_label = user._meta.get_field('last_name').verbose_name
        self.assertEqual(field_label, 'last name')
        
        max_length = user._meta.get_field('last_name').max_length
        self.assertEqual(max_length, 100)
        
        actual_last_name = user.last_name
        self.assertEqual(actual_last_name, 'User')
        
    def test_email(self):
        user = User.objects.get(id=self.user.id)

        field_label = user._meta.get_field('email').verbose_name
        self.assertEqual(field_label, 'email address')
        
        is_unique = user._meta.get_field('email').unique
        self.assertTrue(is_unique)
        
        actual_email = user.email
        self.assertEqual(actual_email, 'testuser@email.com')

    def test_required_fields(self):
        self.assertEqual(User.REQUIRED_FIELDS, ['first_name', 'last_name', 'email'])

    def test_username_field(self):
        self.assertEqual(User.USERNAME_FIELD, 'username')


class IncomeTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='test_user',
            first_name='Test',
            last_name='User',
            email='testuser@email.com'
        )

    def test_create_income(self):
        income = Income.objects.create(
            user=self.user,
            amount=500.00,
            source='Salary',
            date='2023-06-01'
        )
        self.assertEqual(income.source, 'Salary')
        self.assertEqual(income.amount, 500)
        self.assertEqual(income.date, '2023-06-01')
        self.assertEqual(income.user.username, 'test_user')

    def test_amount(self):
        income = Income.objects.create(
            user=self.user,
            amount=0.005,
            date='2023-06-01'
        )
        income.refresh_from_db()
        self.assertEqual(income.amount, 0.00)

    def test_source(self):
        income = Income.objects.create(
            user=self.user,
            amount=500.00,
            source='Salary',
            date='2023-06-01'
        )
        max_length = income._meta.get_field('source').max_length
        self.assertEqual(max_length, 100)

class ExpenseTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='test_user',
            first_name='Test',
            last_name='User',
            email='testuser@email.com'
        )
    
    def test_create_expense(self):
        default = Expense.objects.create(
            user=self.user,
            date='2023-06-01'
        )
        self.assertEqual(default.amount, 0)
        self.assertEqual(default.category, 'OTHER')
        self.assertEqual(default.description, '')
        self.assertEqual(default.type, False)

        expense = Expense.objects.create(
            user=self.user,
            amount=500,
            category='FOOD',
            description='Grocery',
            type=False,
            date='2023-06-01',
        )
        self.assertEqual(expense.amount, 500)
        self.assertEqual(expense.category, 'FOOD')
        self.assertEqual(expense.description, 'Grocery')
        self.assertEqual(expense.date, '2023-06-01')
        self.assertEqual(expense.type, False)
        self.assertEqual(expense.user.username, 'test_user')

    def test_amount(self):
        expense = Expense.objects.create(
            user=self.user,
            amount=0.005,
            date='2023-06-01'
        )
        expense.refresh_from_db()
        self.assertEqual(expense.amount, 0.00)

    def test_category(self):
        self.assertEqual(Expense._meta.get_field('category').choices, [
            ('FOOD', 'Food'),
            ('HOUSING', 'Housing'),
            ('TRANSPORTATION', 'Transportation'),
            ('MEDICAL', 'Medical'),
            ('INSURANCE', 'Insurance'),
            ('EDUCATION', 'Education'),
            ('HOUSEHOLD', 'Household'),
            ('SHOPPING', 'Shopping'),
            ('ENTERTAINMENT', 'Entertainment'),
            ('INVESTMENT', 'Investment'),
            ('SUBSCRIPTION', 'Subscription'),
            ('SAVING', 'Saving'),
            ('DEBT', 'Debt'),
            ('OTHER', 'Other')
        ])

        self.assertEqual(Expense._meta.get_field('category').max_length, 50)

    def test_description(self):
        self.assertEqual(Expense._meta.get_field('description').max_length, 150)

    def test_type(self):
        self.assertEqual(Expense._meta.get_field('type').choices, [
          (True, 'Recurring'),
          (False, 'Non-recurring')
        ])

        self.assertEqual(Expense._meta.get_field('type').max_length, 20)