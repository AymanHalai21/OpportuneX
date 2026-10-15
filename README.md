# OpportuneX - React + Spring Boot + MySQL (Experiment 8 layout)

```
capstone-project/
├── docker-compose.yml     mysql + backend + frontend, one command
├── backend/               Spring Boot API  (own Dockerfile, .gitignore, SQL scripts in backend/database)
└── frontend/              React (Vite) app (own Dockerfile + nginx.conf, .gitignore, .dockerignore)
```

## Run everything with Docker (Task 13)
```bash
docker-compose up --build        # or: docker compose up --build
```
Open http://localhost:3000 - demo login `arjun@iitd.ac.in` / `password123`.
Stop: `Ctrl+C`, then `docker-compose down` (add `-v` to also wipe the database).
If a MySQL is already using port 3306 on your PC: `MYSQL_HOST_PORT=3307 docker-compose up --build`.

## Run without Docker (development)
1. MySQL 8 running locally. Backend: `cd backend && DB_USERNAME=root DB_PASSWORD=yourpassword mvn spring-boot:run` (http://localhost:8080)
2. Frontend: `cd frontend && npm install && npm run dev` (http://localhost:3000, Vite proxies `/api` to :8080)

## Build / run the containers one by one (Task 12)
```bash
cd backend  && docker build -t product-backend .
cd frontend && docker build -t product-frontend .
docker images
# backend needs a MySQL it can reach - easiest is docker-compose; manual run example:
docker run -p 8080:8080 -e DB_URL="jdbc:mysql://host.docker.internal:3306/opportunex?createDatabaseIfNotExist=true&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false" -e DB_USERNAME=root -e DB_PASSWORD=yourpassword product-backend
docker run -p 3000:80 product-frontend
```

## Push to GitHub (Tasks 6-9) - two separate repositories
```bash
cd backend   && git init && git add . && git commit -m "Initial commit: Spring Boot backend with MySQL integration" && git branch -M main && git remote add origin <backend-repo-url> && git push -u origin main
cd ../frontend && git init && git add . && git commit -m "Initial commit: React frontend" && git branch -M main && git remote add origin <frontend-repo-url> && git push -u origin main
```
(`docker-compose.yml` lives one level above both - keep it in the parent folder or add it to either repo.)
