# app/urls.py
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from app import views

urlpatterns = [
    path('users/', views.UserList.as_view()),
    path('users/<int:pk>/', views.UserDetail.as_view()),
    path('users/<int:pk>/incomes', views.IncomeList.as_view()),
    path('users/<int:pk>/expenses', views.ExpenseList.as_view()),
    path('users/<int:pk>/netIncome', views.NetIncome.as_view()),
    path('users/<int:pk>/graphData', views.GraphDataDetail.as_view()),
    path('users/<int:pk>/upcomingExpenses', views.UpcomingExpenses.as_view()),
    path('users/<int:pk>/budget', views.UserBudgetDetail.as_view()),
    path('income/<int:pk>', views.IncomeDetail.as_view()),
    path('expense/<int:pk>', views.ExpenseDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)