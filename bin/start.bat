@echo off
start "" elasticsearch.bat
@REM start "" kibana.bat
@REM start "" "path to logstash bin folder\logstash.bat" -f logstash.conf --config.reload.automatic

cd /d "E:\filebeat-8.17.0-windows-x86_64"
@REM start "" filebeat.exe -e -c filebeat.yml

cd /d "E:\"
start "" ollama run deepseek-r1:1.5b

cd /d "E:\src\llm_service"
start "" uvicorn main:app --host 0.0.0.0 --port 5001 --reload

cd /d "E:\src\server"
start "" nodemon app.js
