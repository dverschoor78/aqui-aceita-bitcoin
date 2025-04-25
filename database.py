import sqlite3, os

class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self.connection = None

    def __enter__(self):
        self.connection = sqlite3.connect(self.db_path)
        self.cursor = self.connection.cursor()
        return self.cursor

    def __exit__(self, exc_type, exc_value, traceback):
        if self.connection:
            self.connection.close()
    
    def init_database(self):
        create_table_query = """
        CREATE TABLE IF NOT EXISTS "company" (
            "id" INTEGER NOT NULL UNIQUE,
            "name" TEXT NOT NULL,
            "logo_path" TEXT NOT NULL,
            "address" TEXT NOT NULL,
            "payment_method" TEXT NOT NULL,
            "email" INTEGER,
            "phone" TEXT,
            "site" TEXT,
            "comment" TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        );
        """
        try:
            if not os.path.exists(self.db_path):
                open(self.db_path, 'w').close()
            self.cursor.execute(create_table_query)
            self.connection.commit()
        except sqlite3.Error as e:
            print(f"Erro ao inicializar o banco de dados: {e}")

if __name__ == "__main__":
    with Database("database.db") as cursor:
        cursor.execute("SELECT * FROM company")
        data = cursor.fetchall()
    print(data)