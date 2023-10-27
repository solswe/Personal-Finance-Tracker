# Register your models here.
from django.contrib import admin
from .models import User, Income, Expense

# class UserAdmin(admin.ModelAdmin):
#     list_display = ("first_name", "last_name", "username", "email",)
    
admin.site.register(User)
admin.site.register(Income)
admin.site.register(Expense)
