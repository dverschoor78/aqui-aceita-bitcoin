from flask import Flask, jsonify, render_template
from database import Database

if __name__ == '__main__':
    app = Flask(__name__)


    ##### ----- API ----- #####

    @app.route('/company/get-companys', methods=['GET'])
    def get_progress():
        with Database("database.db") as cursor:
            cursor.execute("SELECT * FROM company")
            data = cursor.fetchall()
        return jsonify(data)


    ##### ----- SITE ----- #####
    
    @app.route('/', methods=['GET'])
    def index():
        return render_template('index.html')

    app.run(host='0.0.0.0', port=3939)