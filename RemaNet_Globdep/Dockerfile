# Utilise une image officielle de Python
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Lancer l'app avec Uvicorn
CMD ["uvicorn", "RemaNet_globdep.Server.main:app", "--host", "0.0.0.0", "--port", "8000"]