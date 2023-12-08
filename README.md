# Personal-Finance-Tracker

## Set up backend

All the set up is done by following [this toturial](https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react).

1. Clone the repository. 

2. Install a Python virtual environment and activate it.
    ```
    pip install pipenv
    ```
    ```
    pip install -r requirements.txt
    ```
    ```
    pipenv shell
    ```

3. Install all necessary libraries.
    ```
    pipenv install django djangorestframework django-cors-headers
    ```

4. Go to the 'backend' sub directory.
    ```
    cd backend
    ```

5. Create your own super user.
    ```
    python manage.py createsuperuser
    ```

6. Run the server.
    ```
    python manage.py runserver
    ```

7. Go to [Admin pannel](http://localhost:8000/admin) and log in with your super user account.

<br/>

## Set up frontend

1. You must have Node.js installed.

2. Go to the 'frontend' sub directory.
    ```
    cd frontend
    ```

3. In the project directory, you can run:

    ```
    npm start
    ```
    Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
    The page will reload if you make edits.\
    You will also see any lint errors in the console.

    ```
    npm test
    ```
    Launches the test runner in the interactive watch mode.\
    See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

    ```
    npm run build
    ```
    Builds the app for production to the `build` folder.\
    It correctly bundles React in production mode and optimizes the build for the best performance.\
    The build is minified and the filenames include the hashes.
   
    Your app is ready to be deployed!
