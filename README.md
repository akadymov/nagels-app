# nigels-app-ui

Nigels card game application.
Created with [Flask framework], [ReactJS framework], [Material design guidelines].
Specification: [Product requirements]

### Getting started

1. Install all packages from api/requirements.txt. You can use following command in api folder terminal:
    ```sh
    api$ pip install -r requirements.txt
2. Set up backend configs. All configurable variables should be stored in api/config.yml.
3. Create Sqlite db with flask migrate and sqlalchemy. Use following commands (creates api/migrations folder and api/app.db file):
    ```sh
    api$ flask db init
    api$ flask db migrate
    api$ flask db upgrade
4. **[Optional]** Run integration tests by running command:
    ```sh
    api$ python -m unittest tests/integration/united.py
5. Run the application API by command:
    ```sh
    api$ python nigels-app.py
6. Install js-dependencies by running following comand in root folder terminal:
    ```sh
    $ npm install
7. Set frontend configs in /src/config.json
8. Run the application by command:
    ```sh
    $ npm start
[Product requirements]: https://docs.google.com/spreadsheets/d/117oYt6tzSbarLFpdtWTk-ohP1Usm7WvgBH-RtXKfbB4/edit?usp=sharing
[Material design guidelines]: https://m3.material.io/
[Flask framework]: https://flask.palletsprojects.com/