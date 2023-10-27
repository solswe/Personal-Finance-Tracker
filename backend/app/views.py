import json
import jwt
import datetime
from dateutil.relativedelta import *

from functools import wraps
from authlib.integrations.django_client import OAuth
from django.conf import settings
from django.shortcuts import redirect, render, redirect
from django.urls import reverse
from urllib.parse import quote_plus, urlencode
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.http import Http404, JsonResponse
from django.db.models import Sum
from .models import User, Income, Expense
from .serializers import UserSerializer, IncomeSerializer, ExpenseSerializer

"""
Auth
"""

oauth = OAuth()

oauth.register(
    "auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f"https://{settings.AUTH0_DOMAIN}/.well-known/openid-configuration",
)

def index(request):

    return render(
        request,
        "index.html",
        context={
            "session": request.session.get("user"),
            "pretty": json.dumps(request.session.get("user"), indent=4),
        },
    )

def login(request):
    return oauth.auth0.authorize_redirect(
        request, request.build_absolute_uri(reverse("callback"))
    )

def callback(request):
    token = oauth.auth0.authorize_access_token(request)
    request.session["user"] = token
    return redirect(request.build_absolute_uri(reverse("index")))

def logout(request):
    request.session.clear()

    return redirect(
        f"https://{settings.AUTH0_DOMAIN}/v2/logout?"
        + urlencode(
            {
                "returnTo": request.build_absolute_uri(reverse("index")),
                "client_id": settings.AUTH0_CLIENT_ID,
            },
            quote_via=quote_plus,
        ),
    )


"""
USER
"""
class UserDetail(APIView):
  #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  def get_object(self, pk):
    try:
      return User.objects.get(pk=pk)
    except User.DoesNotExist:
      raise Http404
    
  # Retrieve
  def get(self, request, pk, format=None):
    user = self.get_object(pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)
  
  # Update
  def put(self, request, pk, format=None):
    user = self.get_object(pk)
    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)
    return ResourceWarning(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  # Delete
  def delete(self, request, pk, format=None):
    user = self.get_object(pk)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

class UserList(APIView):
    #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # List all users
    def get(self, request, format=None):
      users = User.objects.all()
      serializer = UserSerializer(users, many=True)
      return Response(serializer.data)
    
    # Insert a new user
    def post(self, request, format=None):
      serializer = UserSerializer(data=request.data)
      if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

"""
INCOME
"""
class IncomeList(APIView):
  #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  # List all incomes that belong to the user key
  def get(self, request, pk, format=None):
    # Filter by year and month
    year = request.query_params.get('year', None)
    month = request.query_params.get('month', None)
    if year and month:
      year = int(year)
      month = int(month)
      incomes = Income.objects.filter(user=pk, date__year=year, date__month=month)
    else:
      incomes = Income.objects.filter(user=pk)

    # Filter by category if exists
    source = request.query_params.get('source', None)
    if source is not None:
      incomes = incomes.filter(source=source)

    # Calculate statistics
    stat = {}
    total_amount = incomes.aggregate(Sum('amount')).get('amount__sum')
    for choice in Income.INCOME_CATEGORY_CHOICES:
      partial_sum = incomes.filter(source=choice[0]).aggregate(Sum('amount')).get('amount__sum')
      if partial_sum:
        stat[choice[0]] = round(float(partial_sum)/float(total_amount), 3) * 100.0
      else:
        stat[choice[0]] = 0.0

    # Order the result
    incomes = incomes.order_by('-date')
    serializer = ExpenseSerializer(incomes, many=True)
    json = {'list': serializer.data, 'stat': stat}
    return Response(json)
  
  # Insert a new income to the list
  def post(self, request, pk, format=None):
    serializer = IncomeSerializer(data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IncomeDetail(APIView):
  #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  def get_object(self, pk):
    try:
      return Income.objects.get(pk=pk)
    except Income.DoesNotExist:
      raise Http404
    
  # Retrieve
  def get(self, request, pk, format=None):
    income = self.get_object(pk)
    serializer = IncomeSerializer(income)
    return Response(serializer.data)
  
  # Update
  def put(self, request, pk, format=None):
    income = self.get_object(pk)
    serializer = IncomeSerializer(income, data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)
    return ResourceWarning(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  # Delete
  def delete(self, request, pk, format=None):
    income = self.get_object(pk)
    income.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

"""
EXPENSE
"""
class ExpenseList(APIView):
  #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  # List all expenses that belong to the user key
  def get(self, request, pk, format=None):
    # Filter by year and month
    year = request.query_params.get('year', None)
    month = request.query_params.get('month', None)
    if year and month:
      year = int(year)
      month = int(month)
      expenses = Expense.objects.filter(user=pk, date__year=year, date__month=month)
    else:
      expenses = Expense.objects.filter(user=pk)

    # Filter by category if exists
    category = request.query_params.get('category', None)
    if category is not None:
      expenses = expenses.filter(category=category)

    # Calculate statistics
    stat = {}
    total_amount = expenses.aggregate(Sum('amount')).get('amount__sum')
    for choice in Expense.EXPENSE_CATEGORY_CHOICES:
      partial_sum = expenses.filter(category=choice[0]).aggregate(Sum('amount')).get('amount__sum')
      if partial_sum:
        stat[choice[0]] = round(float(partial_sum)/float(total_amount), 3) * 100.0
      else:
        stat[choice[0]] = 0.0

    # Order the result
    expenses = expenses.order_by('-date')
    serializer = ExpenseSerializer(expenses, many=True)
    json = {'list': serializer.data, 'stat': stat}
    return Response(json)
  
  # Insert a new expense into the list
  def post(self, request, pk, format=None):
    serializer = ExpenseSerializer(data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpenseDetail(APIView):
  #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  def get_object(self, pk):
    try:
      return Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
      raise Http404
    
  # Retrieve
  def get(self, request, pk, format=None):
    expense = self.get_object(pk)
    serializer = ExpenseSerializer(expense)
    return Response(serializer.data)
  
  # Update
  def put(self, request, pk, format=None):
    expense = self.get_object(pk)
    serializer = ExpenseSerializer(expense, data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)
    return ResourceWarning(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  # Delete
  def delete(self, request, pk, format=None):
    expense = self.get_object(pk)
    expense.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

''' Net Income
'''
class NetIncome(APIView):
  permission_classes = [permissions.AllowAny]
  def get(self, request, pk, format=None):
    now_year = int(request.query_params.get('year'))
    now_month = int(request.query_params.get('month'))
    now_day = int(request.query_params.get('day'))
    today = datetime.datetime(now_year, now_month, now_day)
    incomes_so_far = Income.objects.filter(user=pk,date__lte=today).aggregate(Sum('amount'))
    expenses_so_far = Expense.objects.filter(user=pk, date__lte=today).aggregate(Sum('amount'))

    # Calculate the net income
    net_income = 0
    if incomes_so_far:
      net_income += incomes_so_far['amount__sum']
    if expenses_so_far:
      net_income -= expenses_so_far['amount__sum']

    return Response({'net_income': net_income}, status=status.HTTP_200_OK)

# Send 5 most recent net income history
class GraphDataDetail(APIView):
  permission_classes = [permissions.AllowAny]

  def getLabel(self, scale, date:datetime.date):
    label = ''
    if (scale == '3y'):
      label = f"{int((date.month-1)/3)}, {date.year}"
    elif (scale == '1y'):
      label = f"{date.month}, {date.year}"
    elif (scale == '6m'):
      label = f"{date.month}, {date.year}"
    elif (scale == '3m'):
      label = f"{date.day}, {date.month}, {date.year}"
    elif (scale == '1m'):
      label = f"{date.day}, {date.month}"
    return label


  def getAbsoluteNetIncomeList(self, pk, scale):
    net_income_list = {}
    # Retrieve objects first
    incomes = Income.objects.filter(user=pk)
    expenses = Expense.objects.filter(user=pk)
    # Get TODAY
    curr_date = datetime.date.today()
    # Set interval and num iteration
    interval = relativedelta(months=-1)
    num_iteration = 5
    curr_date_start = curr_date + relativedelta(day=1)
    curr_date_end = curr_date
    if (scale == '3y'):
      interval = relativedelta(months=-3)
      num_iteration = 11
      quater = int((curr_date.month-1) / 3)
      curr_date_start = curr_date + relativedelta(month=(quater*3)+1, day=1)
      curr_date_end = curr_date
    elif (scale == '1y'):
      interval = relativedelta(months=-2)
      num_iteration = 5
      curr_date_start = curr_date + relativedelta(months=-1, day=1)
      curr_date_end = curr_date
    elif (scale == '6m'):
      pass
    elif (scale == '3m'):
      interval = relativedelta(weeks=-1)
      num_iteration = 11
      curr_date_start = curr_date + relativedelta(weekday=MO(-1))
      curr_date_end = curr_date
    elif (scale == '1m'):
      interval = relativedelta(days=-1)
      num_iteration = curr_date.day - 1
      curr_date_start = curr_date
      curr_date_end = curr_date
    else:
      return ResourceWarning({}, status=status.HTTP_400_BAD_REQUEST)
      
    # Calculate the net income of the current month
    # Retrieve objects and sum up the items
    income_sum = incomes.filter(date__gte=curr_date_start,date__lte=curr_date_end).aggregate(Sum('amount')).get('amount__sum')
    expense_sum = expenses.filter(date__gte=curr_date_start,date__lte=curr_date_end).aggregate(Sum('amount')).get('amount__sum')
    # Calculate the net income
    net_income = 0
    if income_sum and expense_sum:
      net_income = income_sum - expense_sum
    # Store it in the list
    net_income_list[self.getLabel(scale, curr_date_end)] = net_income
    # Calculate the net incomes
    for i in range(num_iteration):
      
      # Create Datetime objects and
      # Calculate the date one interval before
      prev_date_start = curr_date_start + interval
      prev_date_end = curr_date_start + relativedelta(days=-1)
      
      # Retrieve objects and calculate the net income
      income_sum = incomes.filter(date__gte=prev_date_start,date__lte=prev_date_end).aggregate(Sum('amount')).get('amount__sum')
      expense_sum = expenses.filter(date__gte=prev_date_start,date__lte=prev_date_end).aggregate(Sum('amount')).get('amount__sum')
      # Calculate the net income
      net_income = 0
      # If net income and expense items are found
      net_income = 0
      if income_sum:
        net_income += income_sum
      if expense_sum:
        net_income -= expense_sum
      # Store it in the list
      net_income_list[self.getLabel(scale, prev_date_end)] = net_income
      # Update the current month
      curr_date_start = prev_date_start

    # Reverse the list
    net_income_list = dict(reversed(list(net_income_list.items())))
    return net_income_list

  def getMoneyFlow(self, pk, scale):
    net_income_flow = {}
    # Retrieve objects first
    incomes = Income.objects.filter(user=pk)
    expenses = Expense.objects.filter(user=pk)
    # Get TODAY
    curr_date = datetime.date.today()
    # Get net income so far
    incomes_so_far = incomes.filter(date__lte=curr_date).aggregate(Sum('amount'))
    expenses_so_far = expenses.filter(date__lte=curr_date).aggregate(Sum('amount'))
    # Calculate the net income so far
    net_income_so_far = incomes_so_far['amount__sum'] - expenses_so_far['amount__sum']
    # Store it as a current net income
    net_income_flow[self.getLabel(scale, curr_date)] = net_income_so_far
    # Set interval and num iteration
    interval = relativedelta(months=-1)
    num_iteration = 5
    curr_date_start = curr_date + relativedelta(day=1)
    curr_date_end = curr_date
    if (scale == '3y'):
      interval = relativedelta(months=-3)
      num_iteration = 11
      quater = int((curr_date.month-1) / 3)
      curr_date_start = curr_date + relativedelta(month=(quater*3)+1, day=1)
      curr_date_end = curr_date
    elif (scale == '1y'):
      interval = relativedelta(months=-2)
      num_iteration = 5
      curr_date_start = curr_date + relativedelta(months=-1, day=1)
      curr_date_end = curr_date
    elif (scale == '6m'):
      pass
    elif (scale == '3m'):
      interval = relativedelta(weeks=-1)
      num_iteration = 11
      curr_date_start = curr_date + relativedelta(weekday=MO(-1))
      curr_date_end = curr_date
    elif (scale == '1m'):
      interval = relativedelta(days=-1)
      num_iteration = curr_date.day - 1
      curr_date_start = curr_date
      curr_date_end = curr_date
    else:
      return ResourceWarning({}, status=status.HTTP_400_BAD_REQUEST)

    # Calculate the net incomes
    for i in range(num_iteration):
      # Calculate the net income of the current month
      # Retrieve objects and sum up the items
      
      income_sum = incomes.filter(date__gte=curr_date_start,date__lte=curr_date_end).aggregate(Sum('amount')).get('amount__sum')
      expense_sum = expenses.filter(date__gte=curr_date_start,date__lte=curr_date_end).aggregate(Sum('amount')).get('amount__sum')
      # Calculate the net income
      net_income = 0
      if income_sum:
        net_income += income_sum
      if expense_sum:
        net_income -= expense_sum
      net_income_so_far = net_income_so_far - net_income
      # Store it in the list
      prev_date_end = curr_date_start + relativedelta(days=-1)
      net_income_flow[self.getLabel(scale, prev_date_end)] = net_income_so_far
      # Update curr_date
      curr_date_start = curr_date_start + interval
      curr_date_end = prev_date_end

    # Reverse the list
    net_income_flow = dict(reversed(list(net_income_flow.items())))
    return net_income_flow
  
  def get(self, request, pk, format=None):
    scale = request.query_params.get('scale', None)
    if scale is None or scale == '':
      scale = '6m'

    net_income_flow = self.getMoneyFlow(pk, scale)
    net_income_list = self.getAbsoluteNetIncomeList(pk, scale)
    data = {'net_income_flow': net_income_flow, 'net_income_list': net_income_list}
    return Response(data)
  
class UpcomingExpenses(APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request, pk, format=None):
    curr_date = datetime.date.today()

    recurring_expenses = Expense.objects.filter(user=pk, type=True)
    
    # Update the dates of recurring expenses
    for expense in recurring_expenses:
      [y_delta, m_delta, d_delta] = [eval(n) for n in expense.interval.split('-')]
      interval = relativedelta(years=y_delta, months=m_delta, days=d_delta)
      while expense.date < curr_date:
        expense.date += interval

    # Bulk update recurring expenses
    Expense.objects.bulk_update(recurring_expenses, ["date"])

    # Order the result and return top 5
    recurring_expenses = recurring_expenses.filter(date__gte=curr_date, date__lte=curr_date+datetime.timedelta(days=30))
    recurring_expenses = recurring_expenses.order_by('date')
    serializer = ExpenseSerializer(recurring_expenses, many=True)
    return Response(serializer.data)

class UserBudgetDetail(APIView):
  permission_classes = [permissions.AllowAny]
  def get_object(self, pk):
    try:
      return User.objects.get(pk=pk)
    except User.DoesNotExist:
      raise Http404

  def put(self, request, pk, format=None):
    user = self.get_object(pk)
    income_goal = request.query_params.get('incomeGoal', None)
    expense_budget = request.query_params.get('expenseBudget', None)

    ret = {}
    if income_goal is not None:
      user.income_goal = income_goal
      # Save data to be returned
      ret['income_goal'] = user.income_goal
      today = datetime.date.today()
      this_month = datetime.date(year=today.year, month=today.month, day=1)
      monthly_total_income = Income.objects.filter(date__gte=this_month, date__lte=today).aggregate(Sum('amount')).get('amount__sum')
      if monthly_total_income:
        ret['monthly_total_income'] = monthly_total_income
      else:
        ret['monthly_total_income'] = 0.0
    
    if expense_budget is not None:
      user.expense_budget = expense_budget
      # Save data to be returned 
      ret['expense_budget'] = user.expense_budget
      today = datetime.date.today()
      this_month = datetime.date(year=today.year, month=today.month, day=1)
      monthly_total_expense = Expense.objects.filter(date__gte=this_month, date__lte=today).aggregate(Sum('amount')).get('amount__sum')
      if monthly_total_expense:
        ret['monthly_total_expense'] = monthly_total_expense
      else:
        ret['monthly_total_expense'] = 0.0

    user.save()
    
    return Response(ret)
  
  def get(self, request, pk, format=None):
    user = self.get_object(pk)
    income_goal = request.query_params.get('incomeGoal', None)
    expense_budget = request.query_params.get('expenseBudget', None)
    print(income_goal)
    print(expense_budget)

    ret = {}
    if income_goal:
      ret['income_goal'] = user.income_goal
      today = datetime.date.today()
      this_month = datetime.date(year=today.year, month=today.month, day=1)
      monthly_total_income = Income.objects.filter(date__gte=this_month, date__lte=today).aggregate(Sum('amount')).get('amount__sum')
      if monthly_total_income:
        ret['monthly_total_income'] = monthly_total_income
      else:
        ret['monthly_total_income'] = 0.0

    if expense_budget:
      ret['expense_budget'] = user.expense_budget
      today = datetime.date.today()
      this_month = datetime.date(year=today.year, month=today.month, day=1)
      monthly_total_expense = Expense.objects.filter(date__gte=this_month, date__lte=today).aggregate(Sum('amount')).get('amount__sum')
      if monthly_total_expense:
        ret['monthly_total_expense'] = monthly_total_expense
      else:
        ret['monthly_total_expense'] = 0.0

    return Response(ret)
  