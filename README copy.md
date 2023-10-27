# Personal Finance Tracker

## Back-end Feature 3 - APIs

**NOTE**: Please, run the Python virtual environment before you execute the development server (before executing `python manage.py runserver` command). 

### How to Make APIs with Django

Before jumping into writing code, please read the following tutorials.
* [Tutorial Part 3](https://docs.djangoproject.com/en/4.2/intro/tutorial03/)
* [Django REST Framework Tutorial](https://www.django-rest-framework.org/tutorial/quickstart/)


### Models + Serializers + Views

We will leverage the Django REST Framework module. The REST Framework module supports various functions for building up a modern REST API that can be integrated with the Django framework.



#### Models
First, let's say we have models, `Author` and `Book`. These models have the following structure.

```python
# models.py
from django.db import models

class Author(models.Model):
  first_name = models.CharField(max_length=150)
  last_name = models.CharField(max_length=150)
  birth_date = models.DateField()

class Book(models.Model):
  author = models.ForeignKey(Author, related_name='books', on_delete=models.CASCADE)
  title = models.CharField(max_length=250)
  publisher = models.CharField(max_length=100)
  date = models.DateField()

```

#### Serializers

Serializers take parts of rendering or parsing data sent or recieved between the views and the server, enabling efficient communication of the Web REST API. The serializers can pack a model instance tightly for sending out from the server or parse the compressed data into Python native datatypes. Namely, a serializer works as a translator in the server.

You can find more information about the roles of serializers in the abovementioned tutorial.

Serializers can have multiples functions of different purposes for basic CRUD operations (create, read, updata, and delete). The regular serializer class looks like this:

```python
# serializers.py
from rest_framework import serializers

class AuthorSerializer(serializers.Serializer):
  id = serializers.IntegerField(read_only=True)
  first_name = serializers.CharField(max_length=150)
  last_name = serializers.CharField(max_length=150)
  birth_date = serializers.DateField()
  books = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

  def create(self, validated_data):
    return Author.objects.create(**validated_data)

  def update(self, instance, validated_data):
    instance.first_name = validated_data.get('first_name', instance.first_name)
    instance.last_name = validated_data.get('last_name', instance.last_name)
    instance.birth_date = validated_data.get('birth_date', instance.birth_date)
    instance.save()
    return instance

class BookSerializer(serializers.Serializer):
  id = serializers.IntegerField(read_only=True)
  author = serializers.PrimaryKeyRelatedField(Author, on_delete=models.CASCADE)
  title = serializers.CharField(max_length=250)
  publisher = serializers.CharField(max_length=100)
  date = serializers.DateField()

  def create(self, validated_data):
    return Book.objects.create(**validated_data)

  def update(self, instance, validated_data):
    instance.author = validated_data.get('author', instance.author)
    instance.title = validated_data.get('title', instance.title)
    instance.publisher = validated_data.get('publisher', instance.publisher)
    instance.date = validated_data.get('date', instance.date)
    instance.save()
    return instance
```

Note that the `create()` and `update()` methods define how instances are created or modified.

Serializer class provides built-in methods that allow for users to parse and serialize data easily. However, users must explicitly define data fields and types in order to enable the automatic validation and formatting of the serializer.
In this regard, as we already know that the serializers will be closely related to the Django models in our cases, using ModelSerializer class can save so much time.

ModelSerializer is advantageous in that:
- It will automatically generate a set of fields for you, based on the model.
- It will automatically generate validators for the serializer, such as unique_together validators.
- It includes simple default implementations of `.`create()` and `update()`.
<sub>- [Model Serializer](https://www.django-rest-framework.org/api-guide/serializers/#declaring-serializers) -<sub>

Defining model serializer classes is straightforward.

```python
# serializers.py
from rest_framework import serializers
from .models import Author, Book

class AuthorSerializer(serializers.ModelSerializer):
  books = BookSerializer(many=True, read_only=True)

  class Meta:
    model = Author
    fields = ['id', 'first_name', 'last_name', 'birth_date', 'books']

class BookSerializer(serializers.ModelSerializer):
  class Meta:
    model = Book
    fields = ['id', 'author', 'title', 'publisher', 'date']

```

#### Views

Now, the views will be worked as endpoints of the API.

```python
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from .models import Book
from serializers import BookSerializer

class BookList(APIView):
  """
  List all books, or insert a new book.
  """
  def get(self, request, format=None):
    books = Book.objects.all()  # return all book objects
    serializer = BookSerializer(books, many=True) # serialize the book data.
    # the many=True flag tells that it will serialize query sets instead of model instances.
    return Response(serializer.data)

  def post(self, request, format=None):
    serializer = BookSerializer(data=request.data)  # serialize the requested data
    if serializer.is_valid(): #if the request has the right form
      serializer.save() # save the data
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookDetail(APIView):
  """
  Retrieve, update or delete a book instance.
  """
  def get_object(self, pk):
    try:
      return Book.objects.get(pk=pk)
    except Book.DoesNotExist:
      raise Http404

  def get(self, request, pk, format=None):
    book = self.get_object(pk)
    serializer = BookSerializer(book)
    return Response(serializer.data)

  def put(self, request, pk, format=None):
    book = self.get_object(pk)
    serializer = BookSerializer(book, data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  def delete(self, request, pk, format=None):
    book = self.get_object(pk)
    book.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

```

```python
# app/urls.py
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from app import views

urlpatterns = [
    path('books/', views.BookList.as_view()),
    path('books/<int:pk>/', views.BookDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
```

```python
# backend/urls.py
from django.urls import path
from .app import views

urlpatterns = [
    path('admin/', admin.site.urls),
]

```
