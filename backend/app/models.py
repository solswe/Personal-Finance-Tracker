from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

# Interval Validator:
# It consists of three fields, yy-mm-dd.
# The number of years can't exceed 10.
# The number of months can't exceed 11.
# The number of days can't exceed 30.
interval_validator = RegexValidator(r"\b([0-9]|10)\-\b([0-9]|1[0-1])\-\b([0-9]|[12][0-9]|30)", "The interval format is wrong.")
# Create your models here.

# GC: Deleted 'username' as it is already implemented in 'AbstractUser' class
# GC: Deleted 'USERNAME_FIELD' as it is already set in 'AbstractUser' class
# GC: Deleted 'username' field from 'REQUIRED_FIELDS'
class User(AbstractUser):
  first_name = models.CharField(max_length=100, default='')
  last_name = models.CharField(max_length=100, default='')
  email = models.EmailField(('email address'), unique = True)
  income_goal = models.DecimalField(default=0.00, max_digits=15, decimal_places=2, blank=True)
  expense_budget = models.DecimalField(default=0.00, max_digits=15, decimal_places=2, blank=True)
  REQUIRED_FIELDS = ['first_name', 'last_name', 'email']

  def __str__(self):
      return "{}".format(self.email)
#   pass

# GC: Added max_digit in 'amount' field.
class Income(models.Model):
  INCOME_CATEGORY_CHOICES = [
    ('SALARY', 'Salary'),
    ('INVESTMENT', 'Investment'),
    ('INTEREST', 'Interest'),
    ('GOVERNMENT', 'Government'),
    ('BUSINESS', 'Business'),
    ('DIVIDEND', 'Dividend'),
    ('PENSION', 'Pension'),
    ('OTHER', 'Other')
  ]
  INCOME_TYPE_CHOICES = [
    # Fixed or Non-fixed
    (True, 'Fixed'),
    (False, 'Non-fixed')
  ]
  user = models.ForeignKey(User, related_name='incomes', on_delete=models.CASCADE)
  amount = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
  source = models.CharField(choices=INCOME_CATEGORY_CHOICES, max_length=100, default='OTHER')
  description = models.CharField(max_length=150, default='')
  type = models.BooleanField(choices=INCOME_TYPE_CHOICES, default=False, blank=False)
  interval = models.CharField(max_length=10, validators=[interval_validator], blank=True)
  date = models.DateField()

# GC: Added max_digit in 'amount' field.

class Expense(models.Model):
  EXPENSE_CATEGORY_CHOICES = [
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
  ]
  EXPENSE_TYPE_CHOICES = [
    # Recurring or Non-recurring
    (True, 'Recurring'),
    (False, 'Non-recurring')
  ]
  user = models.ForeignKey(User, related_name='expenses', on_delete=models.CASCADE)
  amount = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
  category = models.CharField(choices=EXPENSE_CATEGORY_CHOICES, max_length=50, default='OTHER')
  description = models.CharField(max_length=150, default='')
  type = models.BooleanField(choices=EXPENSE_TYPE_CHOICES, default=False, blank=False)
  interval = models.CharField(max_length=10, validators=[interval_validator], blank=True)
  date = models.DateField()
