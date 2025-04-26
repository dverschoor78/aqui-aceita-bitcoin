from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import dotenv

dotenv.load_dotenv('.env')

app = Flask(__name__, static_folder='static')
CORS(app)

DB_FILE_PATH = dotenv.get_key('.env', 'DB_FILE_PATH') or 'database.db'
UPLOAD_FOLDER = os.path.join(app.static_folder, 'logos')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def init_db():
    with sqlite3.connect(DB_FILE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS estabelecimentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL,
                endereco TEXT NOT NULL,
                email TEXT,
                telefone TEXT,
                website TEXT,
                observacoes TEXT,
                aceita_lightning BOOLEAN,
                aceita_onchain BOOLEAN,
                aceita_contactless BOOLEAN,
                data_verificacao TEXT,
                logo_filename TEXT
            )
        ''')
        conn.commit()

# Rotas para páginas HTML
@app.route('/')
def serve_index():
    return send_from_directory('.', 'templates/index.html')

@app.route('/cadastro')
def serve_cadastro():
    return send_from_directory('.', 'templates/cadastro.html')

@app.route('/materiais')
def serve_materiais():
    return send_from_directory('.', 'templates/materiais.html')

# Rota para arquivos estáticos (fallback)
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

# API: Cadastro
@app.route('/api/estabelecimentos', methods=['POST'])
def cadastrar_estabelecimento():
    data = request.form
    arquivo = request.files.get('logo')

    nome_arquivo = None
    if arquivo:
        nome_arquivo = f"{datetime.now().timestamp()}_{arquivo.filename}"
        caminho = os.path.join(UPLOAD_FOLDER, nome_arquivo)
        arquivo.save(caminho)

    with sqlite3.connect(DB_FILE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO estabelecimentos (
                nome, tipo, endereco, email, telefone, website, observacoes,
                aceita_lightning, aceita_onchain, aceita_contactless, data_verificacao, logo_filename
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('nome'),
            data.get('tipo'),
            data.get('endereco'),
            data.get('email'),
            data.get('telefone'),
            data.get('website'),
            data.get('observacoes'),
            data.get('aceita_lightning') == 'true',
            data.get('aceita_onchain') == 'true',
            data.get('aceita_contactless') == 'true',
            data.get('data_verificacao'),
            nome_arquivo
        ))
        conn.commit()

    return jsonify({"success": True, "message": "Estabelecimento cadastrado com sucesso."})

# API: Listagem
@app.route('/api/estabelecimentos', methods=['GET'])
def listar_estabelecimentos():
    with sqlite3.connect(DB_FILE_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM estabelecimentos")
        estabelecimentos = [dict(row) for row in cursor.fetchall()]
        return jsonify(estabelecimentos)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=3939, debug=True)
